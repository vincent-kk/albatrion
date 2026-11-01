// Run only inside the authorized window; analyses and fixture construction are untimed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';

import { buildFixture } from '../../../design-optimization/tools/fixtures.mjs';
import { buildAlternatingRows } from '../../../design-optimization/tools/helpers/buildAlternatingRows.mjs';
import { yieldBeforeSample } from '../b9-0/yieldBeforeSample.mjs';
import { median } from '../b9-1/helpers/median.mjs';

const root = path.resolve(process.argv[2]);
const engine = await import(
  pathToFileURL(path.join(root, 'diagnostics/plain.mjs'))
);
const { buildSettlementScopes } = await import(
  pathToFileURL(path.join(root, 'diagnostics/scope-builder.mjs'))
);
const records = [];
for (const row of buildAlternatingRows(true)) {
  const schema =
    row.id === 'wave-1000'
      ? {
          type: 'object',
          properties: Object.fromEntries(
            Array.from({ length: 1000 }, (_, i) => [
              'field_' + i,
              { type: 'number' },
            ]),
          ),
        }
      : buildFixture(
          row.id === 'single-flat-1000-subscribed'
            ? { shape: 'flat', n: 1000 }
            : row,
        );
  const analysis = engine.blueprint(schema);
  const samples = [];
  for (let i = -20; i < 100; i++) {
    await yieldBeforeSample();
    const start = performance.now();
    const table = buildSettlementScopes(analysis);
    const us = (performance.now() - start) * 1000;
    assert.equal(table.size, analysis.settlementScopes.size);
    if (i >= 0) samples.push(us);
  }
  const table = analysis.settlementScopes;
  records.push({
    row: row.id,
    entries: table.size,
    localEntries: [...table.values()].filter(Boolean).length,
    samples,
    medianUs: median(samples),
  });
}
console.log(JSON.stringify({ warmups: 20, sampleCount: 100, records }));
