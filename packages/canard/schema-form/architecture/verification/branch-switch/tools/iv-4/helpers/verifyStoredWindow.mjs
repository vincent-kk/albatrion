import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

import { buildAlternatingRows } from '../../../../design-optimization/tools/helpers/buildAlternatingRows.mjs';
import { summarizeAlternating } from '../../../../design-optimization/tools/helpers/summarizeAlternating.mjs';
import { median } from '../../b9-1/helpers/median.mjs';
import { weightedExchange } from '../../iv-1/weightedExchange.mjs';

/** Recompute a published window from its 440 process records before accepting its verdict. */
export function verifyStoredWindow(directory) {
  if (directory instanceof URL) directory = fileURLToPath(directory);
  const read = (name) =>
    JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
  const raw = JSON.parse(
    gunzipSync(
      fs.readFileSync(path.join(directory, 'pair-samples.json.gz')),
    ).toString(),
  );
  const inputs = read('inputs.json');
  const judgment = read('judgment.json');
  assert.equal(raw.completed, true);
  assert.equal(raw.NODE_ENV, 'production');
  assert.equal(raw.results.length, 440);
  assert.deepEqual(
    [
      raw.config.runs,
      raw.config.warmups,
      raw.config.samples,
      raw.config.quality,
    ],
    [10, 20, 100, 'legacy'],
  );
  assert.equal(new Set(raw.results.map((record) => record.pid)).size, 440);
  for (const lane of ['A', 'B'])
    assert.equal(
      raw.engines[lane].engines.current.sha256,
      inputs.files[lane]['index.node.mjs'].sha256,
    );
  const fixtures = buildAlternatingRows(true);
  for (const [index, fixture] of fixtures.entries()) {
    const group = raw.results.slice(index * 20, (index + 1) * 20);
    assert.deepEqual(
      group.map(({ lane, repeat }) => [lane, repeat]),
      Array.from({ length: 10 }, (_, repeat) => [
        ['A', repeat],
        ['B', repeat],
      ]).flat(),
    );
    for (const record of group) {
      assert.equal(record.row, fixture.id);
      assert.equal(record.samples.current.length, 100);
      assert.equal(
        record.samples.legacy.length,
        'currentOnly' in fixture && fixture.currentOnly ? 0 : 100,
      );
      assert.equal(record.minima.current, Math.min(...record.samples.current));
    }
  }
  const rows = summarizeAlternating(fixtures, raw.results, 'legacy');
  assert.deepEqual(read('rows.json'), rows);
  const weights = JSON.parse(
    fs.readFileSync(
      new URL('../../window/eventWeights.json', import.meta.url),
      'utf8',
    ),
  );
  const exchange = weightedExchange(rows.rows, weights);
  assert.equal(judgment.rawExchangeUs, exchange.totalUs);
  const cold = read('iv2-first-write-exchange.json');
  assert.equal(cold.originalTotalUs, exchange.totalUs);
  assert.equal(
    cold.addedTotalUs,
    cold.additions.reduce((sum, entry) => sum + entry.contributionUs, 0),
  );
  assert.ok(cold.addedTotalUs >= 0);
  assert.equal(judgment.exchangeUs, exchange.totalUs + cold.addedTotalUs);
  const heaps = read('heap.json');
  assert.deepEqual(
    heaps.map((heap) => heap.runtime),
    ['node', 'bun'],
  );
  for (const heap of heaps) {
    assert.equal(heap.A.samples.length, 7);
    assert.equal(heap.B.samples.length, 7);
    assert.equal(heap.Amax, Math.max(...heap.A.samples));
    assert.equal(heap.Bmedian, median(heap.B.samples));
    assert.equal(heap.passed, heap.Bmedian <= heap.Amax);
  }
  assert.deepEqual(judgment.heaps, heaps);
  assert.equal(judgment.productHead, inputs.candidateCommit);
  assert.equal(judgment.baselineHead, inputs.baselineCommit);
  const regressions = rows.rows
    .filter((row) => row.decision === 'regressed')
    .map((row) => row.id);
  assert.deepEqual(judgment.regressions, regressions);
  assert.deepEqual(
    judgment.test073Regressions,
    read('test073.json').filter((row) => row.regression),
  );
  const adoptable =
    judgment.deviceCompleted &&
    rows.quality.passed &&
    judgment.exchangeUs < 0 &&
    regressions.length === 0 &&
    judgment.test073Regressions.length === 0 &&
    heaps.every((heap) => heap.passed);
  assert.equal(judgment.adoptable, adoptable);
  assert.equal(adoptable, true, 'Stored window is not adoptable');
  return judgment;
}
