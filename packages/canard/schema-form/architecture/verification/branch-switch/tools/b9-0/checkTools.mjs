// Invoked by CLI; synthetic verification never opens a performance window.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { ledgerNames as previousLedger } from '../b6/buildStages.mjs';
import { ledgerNames, stageNames } from './buildStages.mjs';
import { instrumentDetails } from './instrumentDetails.mjs';
import { rows } from './rows.mjs';
import { yieldBeforeSample } from './yieldBeforeSample.mjs';

assert.deepEqual(ledgerNames, previousLedger);
assert.equal(rows.length, 6);
assert.equal(rows[4].siblings, 250);
assert.equal(rows[5].siblings, 1000);
for (const name of [
  'selectNodeSchema',
  'preserveReferences',
  'sameValue',
  'captureDetachedFieldNodeReads',
  'misfitIndexBuild',
  'registryRemoval',
  'DetachedWriteAddress.retain',
])
  assert.ok(stageNames.includes(name), name);
const input =
  'export const finalizeExits = () => { if (!misfitIndex) { misfitIndex = new Map(); } getGateRegistry(node.runtime).remove(node); };';
const result = instrumentDetails(input, 'finalizeExits.ts', 'supplemental');
assert.ok(result.contents.includes('"misfitIndexBuild"'));
assert.ok(result.contents.includes('"registryRemoval"'));
assert.ok(result.contents.includes('finally'));
const unchanged = instrumentDetails(input, 'finalizeExits.ts', 'wrapped');
assert.equal(unchanged.contents, input);
const callback = instrumentDetails(
  'const createStaticEntryReuser = () => { return (entry) => { return true; }; };',
  'createStaticEntryReuser.ts',
  'diagnostic',
);
assert.ok(callback.contents.includes('staticReuserCalls++'));
// The legacy bundle resets its batch guard on a macrotask, beyond Promise jobs.
let batches = 0;
for (let sample = 0; sample < 120; sample++) {
  await yieldBeforeSample();
  if (batches === 0)
    setTimeout(() => {
      batches = 0;
    }, 0);
  assert.ok(++batches <= 100, 'Legacy macro-turn batch guard');
  for (let job = 0; job < 8; job++) await Promise.resolve();
}
execFileSync(
  process.execPath,
  [fileURLToPath(new URL('../window/checkQuietProcess.mjs', import.meta.url))],
  { stdio: 'inherit' },
);
console.log('B9_0_TOOLS_OK');
