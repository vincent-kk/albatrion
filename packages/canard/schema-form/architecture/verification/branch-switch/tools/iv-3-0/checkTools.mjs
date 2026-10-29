// Synthetic measurement-device checks; never build a form or take performance samples.
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { attributeSamples } from './helpers/attributeSamples.mjs';
import { collectStackTimes } from './helpers/collectStackTimes.mjs';
import { renderReport } from './helpers/renderReport.mjs';
import { sanitizeProfile } from './helpers/sanitizeProfile.mjs';
import { summarizePeriods } from './helpers/summarizePeriods.mjs';

const mapping = JSON.parse(
  fs.readFileSync(new URL('./branches.json', import.meta.url), 'utf8'),
);
const names = [
  '(root)',
  'FieldNode',
  'selectChildren',
  '(garbage collector)',
  '(program)',
  'unknown',
  '(idle)',
];
const profile = {
  startTime: 0,
  nodes: names.map((functionName, id) => ({
    id,
    callFrame: { functionName, url: 'prepared/engine.mjs', lineNumber: 1 },
  })),
  samples: [5, 1, 2, 3, 4, 6, 5, 5],
  timeDeltas: [50, 80, 80, 40, 120, 80, 80, 80],
};
const wall = {
  row: 'synthetic',
  intervalUs: 50,
  switches: 1,
  writesPerSwitch: 2,
  blocks: [{ startUs: 100, endUs: 550, switches: 1 }],
};
const summary = attributeSamples(
  profile,
  wall,
  mapping,
  '//#region src/example.ts\nconst x = 1;',
);
assert.equal(summary.selectedSamples, 6);
assert.equal(summary.excludedSamples, 2);
assert.equal(summary.activeSamples, 4);
assert.equal(summary.selfUsPerSwitch, 320);
assert.equal(summary.nominalSelfUsPerSwitch, 200);
assert.equal(summary.measuredPeriodUs, 80);
assert.equal(summary.reconciliationRatio, 320 / 450);
assert.equal(summary.reconciled, false);
assert.equal(
  summary.table.reduce((sum, entry) => sum + entry.samples, 0),
  4,
);
assert.equal(
  summary.groups.reduce((sum, entry) => sum + entry.percent, 0),
  100,
);
assert.deepEqual(summary.decisions, { A: 80, B: 40 });
assert.equal(summary.decisionAExtendedUs, 80);
assert.equal(summary.excludedPercent, (160 / 480) * 100);
assert.equal(
  summary.table.find((entry) => entry.name === 'unknown').group,
  'OTHER',
);
assert.equal(
  summary.table.find((entry) => entry.name === 'FieldNode').source,
  'src/example.ts',
);
assert.equal(
  summary.groups.find((entry) => entry.group === 'GC').selfUsPerSwitch,
  120,
);
const skewedWall = {
  ...wall,
  switches: 3,
  blocks: [
    { startUs: 100, endUs: 200, switches: 1 },
    { startUs: 200, endUs: 300, switches: 1 },
    { startUs: 300, endUs: 550, switches: 1 },
  ],
};
const skewed = attributeSamples(
  profile,
  skewedWall,
  mapping,
  '//#region src/example.ts\nconst x = 1;',
);
assert.equal(skewed.wallMeanUs, 150);
assert.equal(skewed.wallMedianUs, 100);
assert.equal(skewed.reconciliationRatio, 320 / 450);
assert.equal(skewed.medianRatio, 320 / 3 / 100);
const aliased = structuredClone(profile);
for (const node of aliased.nodes) node.callFrame.url = 'external/engine.mjs';
assert.throws(() => attributeSamples(aliased, wall, mapping, ''));
for (const name of [
  'evaluateGate',
  'evaluateGateValue',
  'readGateSelectionGroup',
])
  assert.ok(!mapping.decisions.B.includes(name));
const controls = {
  ...wall,
  pid: 2,
  blocks: [{ startUs: 100, endUs: 400, switches: 1 }],
};
const profiled = { ...wall, pid: 1 };
const withPlain = attributeSamples(
  profile,
  profiled,
  mapping,
  '//#region src/example.ts\nconst x = 1;',
  controls,
);
assert.equal(withPlain.collectorOverheadRatioMean, 1.5);
assert.equal(withPlain.collectorOverheadRatioMedian, 1.5);
assert.throws(() =>
  attributeSamples(profile, profiled, mapping, '', { ...controls, pid: 1 }),
);
const locationProfile = structuredClone(profile);
locationProfile.nodes[1].callFrame = {
  functionName: '',
  url: 'prepared/engine.mjs',
  lineNumber: mapping.frameLocations[0].line - 1,
};
const locationBundle = Array.from(
  { length: mapping.frameLocations[0].line },
  (_, index) =>
    index === 0
      ? '//#region src/core/engine/settle/utils/transition/finalizeExits.ts'
      : '',
).join('\n');
const scopedTable = attributeSamples(
  locationProfile,
  wall,
  mapping,
  locationBundle,
);
assert.equal(
  scopedTable.table.find((entry) => entry.name === '(anonymous)').group,
  'A',
);
const movedLocation = structuredClone(locationProfile);
const inferredLocation = structuredClone(locationProfile);
inferredLocation.nodes[1].callFrame.functionName = 'visitFieldNodes.owned';
assert.equal(
  attributeSamples(inferredLocation, wall, mapping, locationBundle).table.find(
    (entry) => entry.name === 'visitFieldNodes.owned',
  ).group,
  'A',
);
const bodyProfile = structuredClone(profile);
bodyProfile.nodes[5].callFrame.functionName = 'computeNodeBody';
const bodyTable = attributeSamples(
  bodyProfile,
  wall,
  mapping,
  '//#region src/example.ts\nconst x = 1;',
);
assert.equal(bodyTable.decisions.B, summary.decisions.B + 80);
movedLocation.nodes[1].callFrame.lineNumber--;
assert.equal(
  attributeSamples(movedLocation, wall, mapping, locationBundle).table.find(
    (entry) => entry.name === '(anonymous)',
  ).group,
  'OTHER',
);
const periods = summarizePeriods([41, 42, 42, 83, 83, 84, 125, 125, 125]);
assert.ok(Math.abs(periods.quantizationUnitEstimateUs - 42) < 1);
assert.equal(summarizePeriods([83, 83, 84]).quantizationUnitEstimateUs, null);
assert.throws(() => summarizePeriods([]));
const report = renderReport(
  {
    productBase: 'fixture',
    head: 'fixture',
    node: 'fixture',
    platform: 'fixture',
    arch: 'fixture',
  },
  { completed: false },
  [{ ...withPlain, row: 'single-flat-1000' }],
);
assert.match(report, /self\/평균/);
assert.match(report, /수집\/plain/);
assert.match(report, /unknown \(OTHER/);
assert.match(report, /보조 함수를 뺀 합/);
const reportLines = report.split('\n');
for (let index = 1; index < reportLines.length; index++)
  if (/^\| ---:? /.test(reportLines[index]))
    assert.equal(
      reportLines[index].split('|').length,
      reportLines[index - 1].split('|').length,
      'Markdown table columns match',
    );
assert.equal(summary.nonReplaceableGateEvaluationUs, 0);
assert.match(report, /표본 \d+개/);
const wrongCount = structuredClone(wall);
const stackProfile = {
  startTime: 0,
  nodes: [
    {
      id: 0,
      callFrame: { functionName: '(root)', url: '', lineNumber: 0 },
      children: [1],
    },
    {
      id: 1,
      callFrame: {
        functionName: 'computeNodeBody',
        url: 'prepared/engine.mjs',
        lineNumber: 1,
      },
      children: [2],
    },
    {
      id: 2,
      callFrame: {
        functionName: 'helper',
        url: 'prepared/engine.mjs',
        lineNumber: 1,
      },
    },
    {
      id: 3,
      callFrame: {
        functionName: '(garbage collector)',
        url: '',
        lineNumber: 0,
      },
    },
  ],
  samples: [2, 1, 3],
  timeDeltas: [10, 20, 30],
};
assert.equal(
  collectStackTimes(
    stackProfile,
    { switches: 1, blocks: [{ startUs: 0, endUs: 100 }] },
    mapping,
    '',
  ).bInclusiveUs,
  50,
);
stackProfile.nodes[2].callFrame.functionName = 'cloneSlotSubtree';
assert.equal(
  collectStackTimes(
    stackProfile,
    { switches: 1, blocks: [{ startUs: 0, endUs: 100 }] },
    mapping,
    '',
  ).bInclusiveUs,
  30,
);
wrongCount.switches++;
assert.throws(() => attributeSamples(profile, wrongCount, mapping, ''));
const drifted = structuredClone(profile);
drifted.startTime = 10000;
assert.throws(() => attributeSamples(drifted, wall, mapping, ''));
const missingDelta = structuredClone(profile);
missingDelta.timeDeltas.pop();
assert.throws(() => attributeSamples(missingDelta, wall, mapping, ''));
const portable = sanitizeProfile(
  {
    nodes: [
      { callFrame: { url: 'file:///fixture/repo/a.mjs' } },
      { callFrame: { url: 'file:///fixture/run.noindex/engine.mjs' } },
      { callFrame: { url: 'node:internal/main' } },
      { callFrame: { url: '/unrelated/external.mjs' } },
    ],
  },
  '/fixture/repo',
  '/fixture/run.noindex',
);
assert.deepEqual(
  portable.nodes.map((node) => node.callFrame.url),
  [
    'a.mjs',
    'prepared/engine.mjs',
    'node:internal/main',
    'external/external.mjs',
  ],
);
console.log('IV_3_0_TOOLS_OK');
