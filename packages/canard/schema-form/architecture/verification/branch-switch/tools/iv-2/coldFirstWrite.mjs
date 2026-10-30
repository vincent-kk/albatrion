// Fresh A/B forms per sample; only the first actual write is timed, never construction.
import assert from 'node:assert/strict';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';

import { buildFixture } from '../../../design-optimization/tools/fixtures.mjs';
import { buildAlternatingRows } from '../../../design-optimization/tools/helpers/buildAlternatingRows.mjs';
import { materialize } from '../../../design-optimization/tools/helpers/materialize.mjs';
import { yieldBeforeSample } from '../b9-0/yieldBeforeSample.mjs';
import { median } from '../b9-1/helpers/median.mjs';
import { getStageRoot } from '../window/getStageRoot.mjs';

process.env.NODE_ENV = 'production';
const root = path.resolve(process.argv[2]);
const smoke = process.argv.includes('--smoke');
const count = smoke ? 1 : Number(process.argv[3] ?? 100);
assert.ok(Number.isInteger(count) && count > 0);
const engines = Object.fromEntries(
  await Promise.all(
    ['A', 'B'].map(async (lane) => [
      lane,
      await import(
        pathToFileURL(path.join(getStageRoot(root, lane), 'engines/dist.mjs'))
          .href
      ),
    ]),
  ),
);
const records = [];
for (const row of buildAlternatingRows(true).filter(
  (entry) => entry.operation === 'mount',
)) {
  assert.ok('shape' in row);
  const samples = { A: [], B: [] };
  const analyses = { A: new WeakSet(), B: new WeakSet() };
  const formsCreated = { A: 0, B: 0 };
  for (let index = 0; index < count; index++) {
    const prepared = {};
    for (const lane of index % 2 ? ['B', 'A'] : ['A', 'B']) {
      const engine = engines[lane];
      const node = engine.buildFieldNodeTree({
        jsonSchema: buildFixture(row),
        onChange() {},
      });
      engine.mountFieldNode(node, undefined, undefined, {
        deferValidation: false,
      });
      materialize(node);
      assert.ok(
        !analyses[lane].has(node.runtime.blueprint),
        'Fresh blueprint for each cold form',
      );
      analyses[lane].add(node.runtime.blueprint);
      formsCreated[lane]++;
      const field = node.find(
        row.shape === 'oneOf'
          ? '/kind'
          : row.shape === 'flat'
            ? '/field_000'
            : '/n0/n0/n0/n0/n0/n0',
      );
      assert.ok(field);
      prepared[lane] = { node, field };
    }
    if (!smoke) globalThis.gc?.();
    for (const lane of index % 2 ? ['B', 'A'] : ['A', 'B']) {
      const { node, field } = prepared[lane];
      const value =
        row.shape === 'oneOf' ? 'kind_' + (row.n - 1) : 'iv2-cold-first-write';
      await yieldBeforeSample();
      if (smoke) field.setValue(value);
      else {
        const start = performance.now();
        field.setValue(value);
        samples[lane].push((performance.now() - start) * 1000);
      }
      assert.equal(field.value, value);
      if (row.shape === 'oneOf') assert.equal(node.value.kind, value);
    }
  }
  const AColdUs = smoke ? undefined : median(samples.A);
  const BColdUs = smoke ? undefined : median(samples.B);
  records.push({
    row: row.id,
    entries: row.n,
    entriesMeaning: 'Canonical fixture scale, not cache entry count',
    samples,
    formsCreated,
    AColdUs,
    BColdUs,
    medianUs: smoke ? undefined : Math.max(0, BColdUs - AColdUs),
  });
}
console.log(
  JSON.stringify({
    timed: !smoke,
    warmups: 0,
    sampleCount: count,
    method:
      'Coordinator msg_0799e247ae05: fresh forms per sample, symmetric cold first writes, charge max(0, B median - A median) at weight 1; no warmups.',
    records,
  }),
);
