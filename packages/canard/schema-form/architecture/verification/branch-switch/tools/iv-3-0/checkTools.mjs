// Synthetic measurement-device checks; never build a form or take performance samples.
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { attributeSamples } from './helpers/attributeSamples.mjs';
import { sanitizeProfile } from './helpers/sanitizeProfile.mjs';

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
  timeDeltas: [50, 50, 50, 50, 50, 50, 50, 50],
};
const wall = {
  row: 'synthetic',
  intervalUs: 50,
  switches: 1,
  writesPerSwitch: 2,
  blocks: [{ startUs: 100, endUs: 350, switches: 1 }],
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
assert.equal(summary.selfUsPerSwitch, 200);
assert.equal(summary.reconciliationRatio, 0.8);
assert.equal(summary.reconciled, false);
assert.equal(
  summary.table.reduce((sum, entry) => sum + entry.samples, 0),
  4,
);
assert.equal(
  summary.groups.reduce((sum, entry) => sum + entry.percent, 0),
  100,
);
assert.deepEqual(summary.decisions, { A: 50, B: 50 });
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
  50,
);
const wrongCount = structuredClone(wall);
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
