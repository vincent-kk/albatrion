// Loaded directly for deterministic device checks; no performance samples are taken.
import assert from 'node:assert/strict';

import { attributeNativeAllocations } from './helpers/attributeNativeAllocations.mjs';
import { summarizeAllocations } from './helpers/summarizeAllocations.mjs';
import { summarizeProbe } from './helpers/summarizeProbe.mjs';
import { verifyStoredWindow } from './helpers/verifyStoredWindow.mjs';

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
const native = structuredClone(profile);
native.head.children[0].children[0].callFrame.url = '';
const attributed = attributeNativeAllocations(
  native,
  2,
  'prepared/A/engine.mjs',
);
assert.equal(
  attributed.rows.find((row) => row.function === 'parent').bytes,
  96,
);
assert.equal(
  attributed.rows.reduce((sum, row) => sum + row.bytes, 0),
  96,
);
console.log('IV_4_TOOLS_OK');

const five = [];
let freshPid = 100;
for (const id of ['target', 'protected'])
  for (let repeat = 0; repeat < 5; repeat++)
    for (const lane of ['A', 'B'])
      five.push({
        ...structuredClone(records[0]),
        row: id,
        repeat,
        lane,
        pid: freshPid++,
        blocks: Array.from({ length: 200 }, () => ({
          startUs: 0,
          endUs: lane === 'A' ? 1000 + repeat : 800,
          switches: 100,
        })),
      });
assert.equal(summarizeProbe(five, ['target'], 5).kept, true);
assert.equal(summarizeProbe(five, ['target'], 5).processes, 20);
assert.throws(() => summarizeProbe(five, ['target']));
assert.throws(() => summarizeProbe(five.slice(1), ['target'], 5));
console.log('IV_4_FIVE_REPETITIONS_OK');

assert.throws(
  () =>
    verifyStoredWindow(new URL('../../raw/iv-4/window-1/', import.meta.url)),
  /Stored window is not adoptable/,
);
console.log('IV_4_REJECTED_WINDOW_VERIFIED');
