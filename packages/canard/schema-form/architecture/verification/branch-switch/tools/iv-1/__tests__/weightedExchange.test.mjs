import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { weightedExchange } from '../weightedExchange.mjs';

test('reproduces the superseded window-one exchange of +299 microseconds', () => {
  const rows = JSON.parse(
    fs.readFileSync(
      new URL('../../../raw/iv-1/window-1/rows.json', import.meta.url),
    ),
  ).rows;
  const weights = JSON.parse(
    fs.readFileSync(new URL('../../window/eventWeights.json', import.meta.url)),
  );
  const result = weightedExchange(rows, weights);
  assert.equal(Math.round(result.totalUs), 299);
  assert.equal(result.rows.filter((row) => row.deltaUs !== 0).length, 4);
  assert.equal(result.passed, false);
});

test('does not amplify an unproved change with a large event frequency', () => {
  const result = weightedExchange(
    [
      {
        id: 'leaf',
        operation: 'leaf',
        A: { ms: 1 },
        B: { ms: 1.125 },
        decision: 'unproven',
      },
    ],
    { leaf: { weight: 10000, eventsPerSample: 1, basis: 'Noise control' } },
  );
  assert.equal(result.totalUs, 0);
  assert.equal(result.rows[0].contributionUs, 0);
  assert.equal(result.weightedAUs, 10000000);
});

test('exchanges a mount regression only for a strictly negative total', () => {
  const weights = {
    mount: { weight: 1, eventsPerSample: 1, basis: 'Mount' },
    input: { weight: 1, eventsPerSample: 1, basis: 'Input' },
  };
  const rows = [
    {
      id: 'mount',
      operation: 'mount',
      A: { ms: 1 },
      B: { ms: 1.125 },
      decision: 'regressed',
    },
    {
      id: 'input',
      operation: 'single',
      A: { ms: 1 },
      B: { ms: 0.75 },
      decision: 'improved',
    },
  ];
  assert.equal(
    weightedExchange(rows, weights).rows[0].verdict,
    'exchange-allowed',
  );
  rows[1].B.ms = 0.875;
  assert.equal(weightedExchange(rows, weights).totalUs, 0);
  assert.equal(weightedExchange(rows, weights).passed, false);
});

test('keeps a write regression failing even when its exchange is negative', () => {
  const rows = [
    {
      id: 'write',
      operation: 'single',
      A: { ms: 1 },
      B: { ms: 1.25 },
      decision: 'regressed',
    },
    {
      id: 'gain',
      operation: 'single',
      A: { ms: 1 },
      B: { ms: 0.5 },
      decision: 'improved',
    },
  ];
  const result = weightedExchange(rows, {
    write: { weight: 1, eventsPerSample: 1, basis: 'Input' },
    gain: { weight: 2, eventsPerSample: 1, basis: 'Input' },
  });
  assert.ok(result.totalUs < 0);
  assert.equal(result.passed, false);
});
