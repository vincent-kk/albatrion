// Postprocess retained samples only; this entry point never starts workers or retries a window.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { buildAlternatingRows } from '../../../design-optimization/tools/helpers/buildAlternatingRows.mjs';
import { summarizeAlternating } from '../../../design-optimization/tools/helpers/summarizeAlternating.mjs';
import { ledgerNames } from '../b9-0/buildStages.mjs';
import { getStageRoot } from '../window/getStageRoot.mjs';
import { collectThroughputSamples } from './helpers/collectThroughputSamples.mjs';
import { evaluateGates } from './helpers/evaluateGates.mjs';
import { median } from './helpers/median.mjs';
import { saveEvidence } from './helpers/saveEvidence.mjs';
import { summarizeStageRows } from './helpers/summarizeStageRows.mjs';
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
const stageRows = [
  'switch-oneOf-80',
  'switch-payload-12',
  'switch-siblings-0',
  'switch-siblings-1000',
];
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
const sibling = recomputed.rows.find(
  (row) => row.id === 'switch-siblings-1000',
);
const siblingStages = [
  'primeHost',
  'selectChildren',
  'registerPresenceChanges',
  'commitSettlement',
].map((name) => {
  const record = (
    name === 'registerPresenceChanges' ? supplemental : stages
  ).find((row) => row.row === sibling.id);
  return {
    name,
    A: record.lanes.A.stages[name].selfUs.median,
    B: record.lanes.B.stages[name].selfUs.median,
  };
});
const protectedTotals = ['switch-oneOf-80', 'switch-siblings-0'].map((row) => {
  const record = stages.find((entry) => entry.row === row);
  return {
    row,
    Amax: record.lanes.A.totalUs.max,
    Bmedian: record.lanes.B.totalUs.median,
  };
});
const regressions = welch.filter(
  (record) => record.comparison === 'all' && record.regression,
);
const gates = evaluateGates({
  quality: recomputed.quality.passed,
  regressions: regressions.length,
  siblingDecision: sibling.decision,
  siblingStages,
  protectedTotals,
  heap: heaps[0],
});
const siblingZero = recomputed.rows.find(
  (row) => row.id === 'switch-siblings-0',
);
const siblingRatio = sibling.B.ms / siblingZero.B.ms;
const judgment = {
  gates,
  siblingStages,
  protectedTotals,
  regressions,
  test093: { ratio: siblingRatio, upperBound: 3, passed: siblingRatio <= 3 },
  validated: {
    rows: 22,
    pairProcesses: 440,
    ledgerProcesses: 24,
    supplementalProcesses: 24,
    warmups: 20,
    samples: 100,
  },
  method:
    'Within-window relative gates; stage values are raw self microseconds per write, including instrumentation overhead. Protected ledger totals use the maximum of A process medians.',
};
const retention = Object.fromEntries(
  stageRows.map((row) => [
    row,
    read(path.join(root, 'retention-' + row + '.log')),
  ]),
);
saveEvidence(
  root,
  output,
  {
    inputs,
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
  },
  { 'pair-samples': raw, 'stage-samples': { ledgers, details } },
);
console.log(
  'B9_1_SUMMARY ' +
    JSON.stringify({
      passed: gates.passed,
      quality: recomputed.quality.ratio,
      regressions: regressions.length,
      siblingDecision: sibling.decision,
      siblingRatio,
      siblingStages,
      protectedTotals,
    }),
);
