// CLI artifact checks validate the review conditions without re-running any measurement.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

import { read } from './files.mjs';

const root = path.resolve(process.argv[2]);
const summary = read(path.join(root, 'stages.json'));
assert.equal(Object.keys(summary.rows).length, 6);
for (const passes of Object.values(summary.rows))
  for (const pass of ['ledger', 'supplemental', 'gap']) {
    const result = passes[pass];
    assert.ok(
      Number.isFinite(result.timerCost.perPairUs.medianUs) &&
        result.timerCost.perPairUs.medianUs > 0,
    );
    for (const metrics of [result.stages, result.scoped])
      for (const [name, value] of Object.entries(metrics)) {
        if (name === 'everythingElse') continue;
        assert.ok(Number.isFinite(value.selfNetUs));
        assert.ok(
          Math.abs(
            value.selfNetUs + value.overheadEstimateUs - value.self.medianUs,
          ) < 0.00001,
        );
      }
  }
assert.equal(Object.keys(summary.rowStageGap).length, 6);
for (const gap of Object.values(summary.rowStageGap)) {
  assert.ok(
    Math.abs(
      gap.pairedGapUs.medianUs -
        (gap.buildDifferenceUs - gap.timerOverheadUs + gap.inWindowResidualUs),
    ) < 0.00001,
  );
  const inspect = (value) => {
    if (typeof value === 'number') assert.ok(Number.isFinite(value));
    else if (value && typeof value === 'object')
      for (const child of Object.values(value)) inspect(child);
  };
  inspect(gap);
}
const cpu = gunzipSync(
  fs.readFileSync(path.join(root, 'cpu-prechecks.json.gz')),
).toString('utf8');
assert.ok(!/\/(?:private\/)?var\/folders\//.test(cpu));
const costs = read(path.join(root, 'cost-splits.json'));
for (const [row, parents] of Object.entries(costs.rows))
  for (const parent of ['computeNode', 'finalizeExits'])
    assert.ok(
      Math.abs(
        parents[parent].reconstructedComparativeSelf.medianUs -
          summary.rows[row].supplemental.ledgerEquivalent[parent].medianUs,
      ) < 0.001,
    );
console.log(
  'B9_0_REVIEW_CONDITIONS_OK timer net estimates, gap identity, portable paths, scoped reconstruction',
);
