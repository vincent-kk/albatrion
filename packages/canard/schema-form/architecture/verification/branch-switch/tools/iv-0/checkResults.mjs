// Recompute published claims from retained samples without launching measurements.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

import { buildAlternatingRows } from '../../../design-optimization/tools/helpers/buildAlternatingRows.mjs';
import { summarizeAlternating } from '../../../design-optimization/tools/helpers/summarizeAlternating.mjs';
import { ledgerNames } from '../b9-0/buildStages.mjs';
import { read } from '../b9-0/files.mjs';
import { summarizeStageRows } from '../b9-1/helpers/summarizeStageRows.mjs';
import { summarizeDiagnostics } from './report/summarizeDiagnostics.mjs';
import { summarizeMilestone } from './report/summarizeMilestone.mjs';
import { summarizeTimings } from './report/summarizeTimings.mjs';

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
assert.deepEqual(summary.timings, summarizeTimings(evidence.details));
assert.deepEqual(
  summary.rows,
  summarizeDiagnostics(
    evidence.rowDiagnostics,
    fixtures.map((row) => row.id),
  ),
);
assert.deepEqual(
  summary.corpus,
  summarizeDiagnostics(
    evidence.deliveryDiagnostics,
    evidence.delivery.rows.map((row) => row.id),
  ),
);
assert.equal(summary.delivery.scenes, 79);
assert.equal(summary.delivery.phases, 429);
assert.equal(summary.delivery.differences, 0);
assert.equal(summary.delivery.extensionScenes, 7);
assert.equal(summary.delivery.extensionPhases, 21);
assert.equal(evidence.stages.length, 24);
assert.deepEqual(
  summary.stages,
  summarizeStageRows(
    {
      A: evidence.stages.filter((record) => record.lane === 'A'),
      B: evidence.stages.filter((record) => record.lane === 'B'),
    },
    [
      'switch-oneOf-80',
      'switch-payload-12',
      'switch-siblings-0',
      'switch-siblings-1000',
    ],
    [...ledgerNames, 'everythingElse'],
    'ledger',
  ),
);
for (const record of evidence.stages) {
  assert.equal(record.warmups, 20);
  assert.equal(record.sampleCount, 100);
  assert.equal(record.stages.length, 100);
  for (const [index, stages] of record.stages.entries()) {
    const sum = Object.values(stages).reduce(
      (sum, stage) => sum + Number(stage.selfUs),
      0,
    );
    assert.ok(Math.abs(sum - record.samples.wrapped[index]) < 0.01);
  }
}
for (const record of [
  ...evidence.alternate.results,
  ...evidence.stages,
  ...evidence.details,
])
  assert.ok(
    cpu.observations.some(
      (check) => check.pid === record.pid && check.approved === true,
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
assert.equal(evidence.pilot.processes, 22);
assert.equal(evidence.inputs.sourceProof.productDiff, false);
assert.equal(evidence.inputs.sourceProof.stageStartAllBlobsMatch, true);
console.log('IV_0_RESULTS_OK rows=22 scenes=79 stages=24 details=18');
