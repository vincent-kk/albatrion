// Run after the single window; compares full-helper self time without rerunning samples.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { getStageRoot } from '../window/getStageRoot.mjs';

/** Median with no changes to the sample order retained in the raw file. */
const median = (values) => {
  const sorted = values.toSorted((a, b) => a - b);
  const middle = (sorted.length - 1) / 2;
  return (sorted[Math.floor(middle)] + sorted[Math.ceil(middle)]) / 2;
};

/** Three-process width and median of each process's sample median. */
const summarize = (values) => ({
  median: median(values),
  min: Math.min(...values),
  max: Math.max(...values),
  processMedians: values,
});

const root = path.resolve(process.argv[2]);
const lanes = {};
for (const lane of ['A', 'B']) {
  const file = getStageRoot(root, lane) + '/stages/supplemental-results.json';
  lanes[lane] = JSON.parse(fs.readFileSync(file, 'utf8')).results;
  assert.equal(lanes[lane].length, 9);
  for (const record of lanes[lane]) {
    assert.equal(record.pass, 'supplemental');
    assert.equal(record.warmups, 20);
    assert.equal(record.sampleCount, 100);
    assert.equal(record.stages.length, 100);
  }
}
assert.equal(
  new Set([...lanes.A, ...lanes.B].map((record) => record.pid)).size,
  18,
);
const rows = [];
for (const row of [
  'switch-oneOf-80',
  'switch-payload-12',
  'switch-siblings-0',
]) {
  for (const stage of ['finalizeExits', 'cloneFromSlot']) {
    const values = {};
    for (const lane of ['A', 'B']) {
      const records = lanes[lane].filter((record) => record.row === row);
      assert.deepEqual(
        records.map((record) => record.repeat),
        [0, 1, 2],
      );
      values[lane] = summarize(
        records.map((record) =>
          median(
            record.stages.map((sample) => {
              const value = sample[stage]?.selfUs ?? 0;
              assert.ok(Number.isFinite(value) && value >= 0);
              return value;
            }),
          ),
        ),
      );
    }
    const deltaUs = values.B.median - values.A.median;
    rows.push({
      row,
      stage,
      ...values,
      deltaUs,
      percent: values.A.median ? (deltaUs / values.A.median) * 100 : null,
    });
  }
}
const result = {
  method:
    'Full-helper supplemental timers, median of three process medians; timer overhead included; diagnostic only',
  rows,
};
fs.writeFileSync(
  path.join(root, 'self-comparison.json'),
  JSON.stringify(result, null, 2) + '\n',
);
console.log(
  'B11_SELF_COMPARISON_OK ' +
    JSON.stringify(
      rows.map(({ row, stage, deltaUs, percent }) => ({
        row,
        stage,
        deltaUs,
        percent,
      })),
    ),
);
