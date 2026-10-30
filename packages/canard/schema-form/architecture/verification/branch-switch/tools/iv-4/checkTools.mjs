// Loaded directly for deterministic device checks; no performance samples are taken.
import assert from 'node:assert/strict';

import { summarizeAllocations } from './helpers/summarizeAllocations.mjs';
import { summarizeProbe } from './helpers/summarizeProbe.mjs';

const records = [];
let pid = 1;
for (const row of ['target', 'protected'])
  for (let repeat = 0; repeat < 3; repeat++)
    for (const lane of ['A', 'B'])
      records.push({
        row,
        repeat,
        lane,
        pid: pid++,
        warmups: 2000,
        switches: 20000,
        blocks: Array.from({ length: 200 }, () => ({
          startUs: 0,
          endUs: 100 * (lane === 'A' ? 10 + repeat : 8),
          switches: 100,
        })),
      });
assert.equal(summarizeProbe(records, ['target']).kept, true);
const equal = structuredClone(records);
for (const record of equal)
  if (record.lane === 'B')
    for (const block of record.blocks) block.endUs = 1000;
assert.equal(summarizeProbe(equal, ['target']).kept, false);
const regressed = structuredClone(records);
for (const record of regressed)
  if (record.lane === 'B' && record.row === 'protected')
    for (const block of record.blocks) block.endUs = 1400;
assert.equal(summarizeProbe(regressed, ['target']).kept, false);
assert.throws(() => summarizeProbe(records.slice(1), ['target']));
const duplicate = structuredClone(records);
duplicate[1].pid = duplicate[0].pid;
assert.throws(() => summarizeProbe(duplicate, ['target']));
assert.throws(() => summarizeProbe(records, ['missing']));
const profile = {
  head: {
    id: 0,
    selfSize: 0,
    callFrame: { functionName: '(root)', url: '', lineNumber: 0 },
    children: [
      {
        id: 1,
        selfSize: 32,
        callFrame: {
          functionName: 'parent',
          url: 'prepared/A/engine.mjs',
          lineNumber: 2,
        },
        children: [
          {
            id: 2,
            selfSize: 64,
            callFrame: {
              functionName: 'child',
              url: 'prepared/A/engine.mjs',
              lineNumber: 4,
            },
            children: [],
          },
        ],
      },
    ],
  },
};
const allocation = summarizeAllocations(profile, 2);
assert.equal(allocation.totalBytes, 96);
assert.equal(allocation.bytesPerOperation, 48);
assert.equal(allocation.frames[0].name, 'child');
assert.equal(
  allocation.frames.find((frame) => frame.name === 'parent').inclusiveBytes,
  96,
);
assert.throws(() => summarizeAllocations(profile, 0));
console.log('IV_4_TOOLS_OK');
