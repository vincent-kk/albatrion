import assert from 'node:assert/strict';
import { test } from 'node:test';

import { judgeMicroHygiene } from '../judgeMicroHygiene.mjs';

const evidence = () => ({
  quality: true,
  rows: Array.from({ length: 22 }, (_, row) => ({
    row: String(row),
    decision: 'unproven',
  })),
  exchange: { totalUs: 0, passed: true },
  regressions: [],
  heaps: [{ passed: true }, { passed: true }],
  deviceCompleted: true,
});
test('zero exchange and no proved changes satisfy the hygiene contract', () => {
  assert.equal(judgeMicroHygiene(evidence()).adoptable, true);
});
test('negative exchange never permits an outside-width mount regression', () => {
  const input = evidence();
  input.exchange.totalUs = -100;
  input.rows[0].decision = 'regressed';
  assert.equal(judgeMicroHygiene(input).adoptable, false);
});
test('positive exchange and incomplete devices are rejected', () => {
  const input = evidence();
  input.exchange.totalUs = 1;
  assert.equal(judgeMicroHygiene(input).adoptable, false);
  input.exchange.totalUs = 0;
  input.deviceCompleted = false;
  assert.equal(judgeMicroHygiene(input).adoptable, false);
});
