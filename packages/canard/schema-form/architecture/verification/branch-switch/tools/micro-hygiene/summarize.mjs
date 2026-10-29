// Postprocess retained samples only; this entry point never starts workers or retries a window.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { buildAlternatingRows } from '../../../design-optimization/tools/helpers/buildAlternatingRows.mjs';
import { summarizeAlternating } from '../../../design-optimization/tools/helpers/summarizeAlternating.mjs';
import { ledgerNames } from '../b9-0/buildStages.mjs';
import { collectThroughputSamples } from '../b9-1/helpers/collectThroughputSamples.mjs';
import { median } from '../b9-1/helpers/median.mjs';
import { readWindowCommandResult } from '../b9-1/helpers/readWindowCommandResult.mjs';
import { saveEvidence } from '../b9-1/helpers/saveEvidence.mjs';
import { summarizeStageRows } from '../b9-1/helpers/summarizeStageRows.mjs';
import { judgeStage } from '../iv-1/judgeStage.mjs';
import { weightedExchange } from '../iv-1/weightedExchange.mjs';
import { getStageRoot } from '../window/getStageRoot.mjs';
import { judgeMicroHygiene } from './judgeMicroHygiene.mjs';
import { verifyInputs } from './verifyInputs.mjs';

const root = path.resolve(process.argv[2]);
const output = path.resolve(process.argv[3]);
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const inputs = verifyInputs(root);
const raw = read(path.join(root, 'pair/results.json'));
assert.equal(raw.completed, true);
assert.equal(raw.results.length, 440);
assert.deepEqual(
  [raw.config.runs, raw.config.warmups, raw.config.samples, raw.config.quality],
  [10, 20, 100, 'legacy'],
);
const rows = buildAlternatingRows(true);
assert.equal(rows.length, 22);
assert.equal(raw.NODE_ENV, 'production');
assert.equal(raw.node.version, inputs.environment.node);
for (const lane of ['A', 'B']) {
  assert.equal(raw.engines[lane].legacyVersion, '0.16.1');
  assert.equal(
    raw.engines[lane].engines.current.sha256,
    inputs.files[lane]['index.node.mjs'].sha256,
  );
}
assert.equal(
  raw.engines.A.engines.legacy.sha256,
  raw.engines.B.engines.legacy.sha256,
);
const recomputed = summarizeAlternating(rows, raw.results, 'legacy');
assert.deepEqual(raw.rows, recomputed.rows);
assert.deepEqual(raw.quality, recomputed.quality);
assert.equal(raw.quality.assessedRows, 18);
assert.equal(raw.validWindow, recomputed.quality.passed);
for (const [index, row] of rows.entries()) {
  const group = raw.results.slice(index * 20, (index + 1) * 20);
  assert.deepEqual(
    group.map((record) => [record.lane, record.repeat]),
    Array.from({ length: 10 }, (_, repeat) => [
      ['A', repeat],
      ['B', repeat],
    ]).flat(),
  );
  assert.ok(group.every((record) => record.row === row.id));
  for (const record of group) {
    assert.equal(record.samples.legacy.length, row.currentOnly ? 0 : 100);
    assert.equal(
      record.minima.legacy,
      row.currentOnly ? null : Math.min(...record.samples.legacy),
    );
  }
}
const pids = raw.results.map((record) => record.pid);
assert.ok(pids.every((pid, index) => pids.indexOf(pid) === index));
for (const record of raw.results) {
  assert.equal(record.samples.current.length, 100);
  assert.equal(record.minima.current, Math.min(...record.samples.current));
  assert.ok(
    record.samples.current.every(
      (value) => Number.isFinite(value) && value > 0,
    ),
  );
}
const packageDir = fileURLToPath(new URL('../../../../../', import.meta.url));
const { welchTTest } = await import(
  pathToFileURL(
    path.resolve(packageDir, '../../aileron/benchmark-form/src/utils/stats.ts'),
  )
);
const welch = [];
for (const row of rows)
  for (const [comparison, lower, upper] of [
    ['all', 0, 10],
    ['early', 0, 5],
    ['late', 5, 10],
  ]) {
    const test = welchTTest(
      collectThroughputSamples(raw.results, row.id, 'A', lower, upper),
      collectThroughputSamples(raw.results, row.id, 'B', lower, upper),
    );
    const percent = 100 * (test.meanB / test.meanA - 1);
    welch.push({
      row: row.id,
      comparison,
      ...test,
      percent,
      regression: percent < -15 && test.pValue < 0.05,
    });
  }
const stageRows = inputs.stages;
const ledgers = Object.fromEntries(
  ['A', 'B'].map((lane) => [
    lane,
    read(getStageRoot(root, lane) + '/stages/results.json').results,
  ]),
);
const details = Object.fromEntries(
  ['A', 'B'].map((lane) => [
    lane,
    read(getStageRoot(root, lane) + '/stages/supplemental-results.json')
      .results,
  ]),
);
const stages = summarizeStageRows(
  ledgers,
  stageRows,
  [...ledgerNames, 'everythingElse'],
  'ledger',
);
const supplemental = summarizeStageRows(
  details,
  stageRows,
  ['registerPresenceChanges'],
  'supplemental',
);
const heaps = ['node', 'bun'].map((runtime) => {
  const A = read(path.join(root, 'heap-' + runtime + '-A.log')).new;
  const B = read(path.join(root, 'heap-' + runtime + '-B.log')).new;
  assert.equal(A.samples.length, 7);
  assert.equal(B.samples.length, 7);
  assert.equal(A.bytesPerNode, median(A.samples));
  assert.equal(B.bytesPerNode, median(B.samples));
  return {
    runtime,
    A,
    B,
    Amax: Math.max(...A.samples),
    Bmedian: B.bytesPerNode,
    passed: B.bytesPerNode <= Math.max(...A.samples),
  };
});
const exchange = weightedExchange(
  recomputed.rows,
  read(fileURLToPath(new URL('../window/eventWeights.json', import.meta.url))),
);
const protectedRows = recomputed.rows.map((row) => ({
  row: row.id,
  decision: row.decision,
  A: row.A.ms,
  Aprime: row.Aprime.ms,
  B: row.B.ms,
  width: row.widthMs,
  passed: row.decision !== 'regressed',
}));
const stageJudgments = stages.map((row) => ({
  row: row.row,
  reductions: [
    'computeNode',
    'selectChildren',
    'markCommitDeliveries',
    'commitSettlement',
  ].map((name) =>
    judgeStage(
      row.row,
      name,
      row.lanes.A.stages[name].selfUs,
      row.lanes.B.stages[name].selfUs,
    ),
  ),
}));
const regressions = welch.filter(
  (record) => record.comparison === 'all' && record.regression,
);
const retention = Object.fromEntries(
  inputs.stages.map((row) => [
    row,
    readWindowCommandResult(root, 'retention-' + row),
  ]),
);
const judgment = judgeMicroHygiene({
  quality: recomputed.quality.passed,
  rows: protectedRows,
  exchange,
  regressions,
  heaps,
  deviceCompleted: Object.values(retention).every((record) => record.completed),
});
judgment.validated = {
  rows: 22,
  pairProcesses: 440,
  ledgerProcesses: stageRows.length * 6,
  supplementalProcesses: stageRows.length * 6,
  warmups: 20,
  samples: 100,
};
judgment.stageJudgments = stageJudgments;
judgment.method =
  'Unchanged IV-1 row recomputation, Welch checks, weightedExchange and judgeStage; every row is protected, exchange <= 0 is accepted, and stage reductions are informational for hygiene.';
saveEvidence(
  root,
  output,
  {
    inputs,
    pilot: read(path.join(root, 'pilot-summary.json')),
    rows: recomputed,
    stages,
    supplemental,
    test073: welch,
    heap: heaps,
    retention,
    judgment,
    'formal-start': read(path.join(root, 'formal-start.json')),
    'window-end': read(path.join(root, 'window-end.json')),
    'stage-load-check': read(path.join(root, 'stage-load-check.json')),
    'untimed-load-check': read(path.join(root, 'untimed-load-check.json')),
    'retention-load-check': read(path.join(root, 'retention-load-check.json')),
    rehearsal: read(path.join(root, 'rehearsal.json')),
  },
  { 'pair-samples': raw, 'stage-samples': { ledgers, details } },
);
console.log(
  'MICRO_HYGIENE_SUMMARY ' +
    JSON.stringify({
      passed: judgment.adoptable,
      quality: recomputed.quality.ratio,
      outsideWidthRegressions: judgment.outsideWidthRegressions,
      weightedExchangeUs: exchange.totalUs,
      test073Regressions: regressions.length,
      heaps: heaps.map((heap) => ({
        runtime: heap.runtime,
        passed: heap.passed,
      })),
    }),
);
