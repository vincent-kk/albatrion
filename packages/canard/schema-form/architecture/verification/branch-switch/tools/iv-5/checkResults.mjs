// Recompute published claims from retained samples without launching measurements.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

import { buildAlternatingRows } from '../../../design-optimization/tools/helpers/buildAlternatingRows.mjs';
import { summarizeAlternating } from '../../../design-optimization/tools/helpers/summarizeAlternating.mjs';
import { read } from '../b9-0/files.mjs';
import { summarizeMilestone } from '../iv-0/report/summarizeMilestone.mjs';

const output = path.resolve(process.argv[2]);
const evidenceText = gunzipSync(
  fs.readFileSync(path.join(output, 'evidence.json.gz')),
).toString();
const cpuText = gunzipSync(
  fs.readFileSync(path.join(output, 'cpu.json.gz')),
).toString();
assert.ok(
  !/\/(?:Users|private\/tmp|var\/folders)\//.test(evidenceText + cpuText),
);
const evidence = JSON.parse(evidenceText),
  cpu = JSON.parse(cpuText);
const summary = read(path.join(output, 'summary.json'));
const fixtures = buildAlternatingRows(true);
assert.equal(fixtures.length, 22);
assert.deepEqual(
  summary.milestone,
  summarizeMilestone(evidence.alternate, fixtures),
);
assert.deepEqual(
  summary.quality,
  summarizeAlternating(fixtures, evidence.alternate.results, 'legacy').quality,
);
for (const record of [...evidence.alternate.results])
  assert.ok(
    cpu.observations.some(
      (check) => check.pid === record.pid && check.gating === false,
    ),
  );
for (const check of cpu.observations) {
  assert.ok(check.rows.length <= 10);
  assert.ok(
    check.rows.every(
      (row) =>
        Object.keys(row).length === 2 && 'name' in row && 'cpuPercent' in row,
    ),
  );
  assert.ok(!('before' in check) && !('after' in check));
  for (const attempt of check.attempts ?? [])
    assert.ok(attempt.rows.length <= 10);
}
assert.equal(summary.window.end.completed, true);
assert.equal(evidence.loadCheck.timed, false);
assert.equal(evidence.rehearsal.workers, 1);
assert.equal(evidence.rehearsal.samples, 1);
for (const role of ['A', 'B']) {
  assert.equal(evidence.pilot[role].processes, 22);
  assert.equal(evidence.pilot[role].results.length, 22);
}
for (const runtime of ['node', 'bun'])
  for (const role of ['A', 'B']) {
    const heap = evidence.heaps[runtime][role];
    assert.equal(heap.new.samples.length, 7);
    assert.equal(heap.legacy.samples.length, 7);
    for (const lane of [heap.new, heap.legacy]) {
      assert.ok(
        lane.samples.every((value) => Number.isFinite(value) && value > 0),
      );
      assert.equal(
        lane.bytesPerNode,
        lane.samples.toSorted((a, b) => a - b)[3],
      );
    }
  }
assert.deepEqual(summary.heaps, evidence.heaps);
for (const kind of ['pilot', 'window']) {
  assert.ok(cpu.starts[kind].at(-1).approved);
  assert.ok(
    cpu.starts[kind].every(
      (attempt) =>
        attempt.policy.averageMs === 30000 &&
        attempt.policy.spotlightMaxWaitMs === 30000,
    ),
  );
}
assert.equal(evidence.inputs.sourceProof.productDiff, false);
assert.equal(evidence.inputs.sourceProof.stageStartAllBlobsMatch, true);
console.log('IV_5_RESULTS_OK rows=22 processes=440 heaps=4');
