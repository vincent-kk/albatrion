// Invoked by the IV-0 verification CLI; these checks never take performance samples.
import assert from 'node:assert/strict';

import { classifyClosure } from './diagnostics/classifyClosure.mjs';
import { createDiagnosticRecorder } from './diagnostics/createDiagnosticRecorder.mjs';
import { instrumentSource } from './instrumentation/instrumentSource.mjs';
import { summarizeDiagnostics } from './report/summarizeDiagnostics.mjs';
import { summarizeMilestone } from './report/summarizeMilestone.mjs';
import { summarizeDetailRecord } from './timing/summarizeDetailRecord.mjs';

const local = classifyClosure({
  target: '/h/kind',
  hosts: ['/h'],
  edges: [{ source: '/h/kind', target: '/h/value', kind: 'gate' }],
});
assert.equal(local.qualifies, true);
assert.equal(local.scope, '/h');
assert.equal(local.useful, true);
assert.equal(
  classifyClosure({
    target: '/h/x',
    hosts: ['/h'],
    edges: [{ source: '/flag', target: '/h', kind: 'index' }],
  }).useful,
  true,
);
assert.equal(
  classifyClosure({
    target: '/h/x',
    hosts: ['/h'],
    edges: [{ source: '', target: '/h', kind: 'required' }],
  }).qualifies,
  false,
);
assert.equal(
  classifyClosure({
    target: '/a/b/x',
    hosts: ['/a/b'],
    edges: [{ source: '/a', target: '/c', kind: 'index' }],
  }).qualifies,
  false,
);
assert.equal(
  classifyClosure({
    target: '/h/a/b',
    hosts: ['/h/a'],
    edges: [{ source: '/h', target: '/h/p', kind: 'gate-if-host' }],
  }).qualifies,
  false,
);
assert.equal(
  classifyClosure({ target: '/h/x', hosts: ['/h'], edges: [], owners: [''] })
    .qualifies,
  false,
);
const crossing = classifyClosure({
  target: '/h/kind',
  hosts: ['/h'],
  edges: [{ source: '/h/kind', target: '/outside', kind: 'watch' }],
});
assert.equal(crossing.qualifies, false);
assert.equal(crossing.reasons[0], 'crossing-watch');
const root = classifyClosure({ target: '/kind', hosts: [''], edges: [] });
assert.equal(root.qualifies, true);
assert.equal(root.useful, false);
assert.equal(root.scope, '');
assert.equal(
  classifyClosure({ target: '/h/kind', hosts: ['/h', '/other'], edges: [] })
    .useful,
  false,
);
assert.equal(
  classifyClosure({
    target: '/h/kind',
    hosts: ['/h'],
    edges: [{ source: '/h/kind', target: '/h/value', kind: 'unknown' }],
  }).qualifies,
  false,
);
const blueprint = { nodes: [], expressions: [] };
const host = {
  path: '/h',
  children: [],
  behavior: { strategy: 'branch' },
  local: {},
  emit: {},
  schema: {},
  active: true,
};
const tree = {
  path: '',
  children: [host],
  behavior: { strategy: 'branch' },
  runtime: { blueprint },
  local: {},
  emit: {},
  schema: {},
  active: true,
};
const target = { path: '/h/kind', rootNode: tree };
const engine = {
  getDependencyIndex: () => ({}),
  getDeriveRuleTable: () => ({ rules: [] }),
};
const recorder = createDiagnosticRecorder(engine);
recorder.enabled = true;
recorder.label = 'synthetic';
recorder.begin(target, 'callerReplace');
recorder.context({ target, root: tree });
recorder.scratch(true);
recorder.allocate('wheel.ts', 'Map');
for (let invocation = 0; invocation < 2; invocation++) {
  const token = recorder.compute(host);
  recorder.roundStart(host, { dirtyPaths: new Set() }, 0);
  recorder.roundEnd(
    host,
    { dirtyPaths: new Set(), shapeDirtyPaths: new Set() },
    0,
    {},
  );
  recorder.computeEnd(token);
}
recorder.settled({
  root: tree,
  changedRaw: new Set(),
  dependencyOwnerPaths: new Set(),
  entered: new Set(),
  exited: new Set(),
});
recorder.end();
assert.equal(recorder.rows.length, 1);
assert.equal(recorder.rows[0].contexts, 1);
assert.equal(recorder.rows[0].scratchNew, 0);
assert.equal(recorder.rows[0].scratchReused, 1);
assert.equal(recorder.rows[0].allocations['wheel.ts:Map'], 1);
assert.equal(recorder.rows[0].emptyRounds, 2);
assert.ok(recorder.rows[0].rounds.every((round) => round.openedNext === false));
assert.equal(recorder.rows[0].computes['/h'], 2);
const deliveryToken = recorder.chainExit();
recorder.allocate('write.ts', 'Set');
recorder.chainExitEnd(deliveryToken);
assert.equal(recorder.rows[0].deliveryAllocations['write.ts:Set'], 1);
const input =
  'export const computeNode = (node, context) => { return new Map(); };';
const transformed = instrumentSource(
  input,
  'src/core/engine/settle/utils/compute/computeNode.ts',
  'diagnostics',
);
assert.equal(
  transformed.sites.filter((site) => site.name === 'computeCall').length,
  1,
);
assert.equal(
  transformed.sites.filter((site) => site.name === 'newMap').length,
  1,
);
const metrics = [
  { f: { selfUs: 8, calls: 2 }, everythingElse: { selfUs: 2, calls: 1 } },
];
const sample = {
  samples: { plain: [6], details: [10], unwrapped: [6], wrapped: [10] },
  stages: { details: metrics, wrapped: structuredClone(metrics) },
};
assert.equal(summarizeDetailRecord(sample, 1).details.stages.f.selfNetUs, 4);
assert.throws(() => summarizeDetailRecord(sample));
const corrupt = structuredClone(sample);
corrupt.stages.details[0].f.selfUs++;
assert.throws(() => summarizeDetailRecord(corrupt, 1));
const milestone = {
  completed: true,
  results: Array.from({ length: 10 }, (_, repeat) =>
    ['A', 'B'].map((lane, index) => ({
      row: 'fixture',
      lane,
      repeat,
      pid: repeat * 2 + index + 1,
      samples: {
        current: Array(100).fill(lane === 'A' ? 2 : 1),
        legacy: Array(100).fill(4),
      },
    })),
  ).flat(),
};
const milestoneSummary = summarizeMilestone(milestone, [{ id: 'fixture' }]);
assert.equal(milestoneSummary[0].endOverStart, 0.5);
assert.equal(milestoneSummary[0].endOverLegacy, 0.25);
assert.equal(milestoneSummary[0].legacyOnePointFiveUs, 6000);
const brokenMilestone = structuredClone(milestone);
brokenMilestone.results[0].pid = brokenMilestone.results[1].pid;
assert.throws(() => summarizeMilestone(brokenMilestone, [{ id: 'fixture' }]));
const diagnosticSummary = summarizeDiagnostics(
  { timed: false, rows: recorder.rows },
  ['synthetic', 'mount'],
);
assert.equal(diagnosticSummary[0].writes, 1);
assert.equal(diagnosticSummary[0].emptyOpeningRounds, 0);
assert.equal(diagnosticSummary[0].allocations.delivery, 1);
assert.equal(diagnosticSummary[1].closedFraction, null);
console.log('IV_0_TOOLS_OK');
