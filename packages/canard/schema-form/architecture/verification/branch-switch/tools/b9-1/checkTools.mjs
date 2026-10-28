// Synthetic gate checks never create a performance window or rerun samples.
import assert from 'node:assert/strict';

import { createStageRecords } from './fixtures/createStageRecords.mjs';
import { evaluateGates } from './helpers/evaluateGates.mjs';
import { portableEvidence } from './helpers/portableEvidence.mjs';
import { summarizeStageRows } from './helpers/summarizeStageRows.mjs';

const input = {
  quality: true,
  regressions: 0,
  siblingDecision: 'improved',
  siblingStages: [
    { name: 'primeHost', A: 10, B: 1 },
    { name: 'selectChildren', A: 10, B: 1 },
    { name: 'registerPresenceChanges', A: 10, B: 1 },
    { name: 'commitSettlement', A: 10, B: 1 },
  ],
  protectedTotals: [
    { row: 'switch-oneOf-80', Amax: 20, Bmedian: 19 },
    { row: 'switch-siblings-0', Amax: 10, Bmedian: 9 },
  ],
  heap: { Amax: 100, Bmedian: 99 },
};
assert.equal(evaluateGates(input).passed, true);
for (const change of [
  { quality: false },
  { regressions: 1 },
  { siblingDecision: 'unproven' },
  { siblingStages: input.siblingStages.map((stage) => ({ ...stage, B: 10 })) },
  {
    protectedTotals: input.protectedTotals.map((row) => ({
      ...row,
      Bmedian: row.Amax + 1,
    })),
  },
  { heap: { Amax: 100, Bmedian: 101 } },
])
  assert.equal(evaluateGates({ ...input, ...change }).passed, false);
assert.throws(() => evaluateGates({ ...input, siblingStages: [] }));
assert.throws(() => evaluateGates({ ...input, protectedTotals: [] }));
assert.throws(() =>
  evaluateGates({ ...input, heap: { Amax: 100, Bmedian: NaN } }),
);
const lanes = { A: createStageRecords(2), B: createStageRecords(1) };
const stages = summarizeStageRows(lanes, ['fixture'], ['primeHost'], 'ledger');
assert.equal(stages[0].lanes.A.totalUs.median, 6);
assert.equal(stages[0].lanes.B.stages.primeHost.selfUs.median, 1);
assert.throws(() =>
  summarizeStageRows(
    { A: [], B: lanes.B },
    ['fixture'],
    ['primeHost'],
    'ledger',
  ),
);
lanes.A[0].samples.wrapped[0]++;
assert.throws(() =>
  summarizeStageRows(lanes, ['fixture'], ['primeHost'], 'ledger'),
);
const homePath = ['', 'Users', 'Example', 'workspace'].join('/');
assert.equal(portableEvidence({ file: homePath }).file, '<home>/workspace');
console.log('B9_1_TOOLS_OK');
