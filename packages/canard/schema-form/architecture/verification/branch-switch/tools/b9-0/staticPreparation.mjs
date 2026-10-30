// CLI reads the scratch-only exports after each fixture's first switch write.
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { json, verifyInputs } from './files.mjs';
import { setupWrite } from './operation.mjs';
import { createUntimedRecorder } from './untimedRecorder.mjs';

process.env.NODE_ENV = 'production';
const root = path.resolve(process.argv[2]);
verifyInputs(root);
globalThis.__b0 = createUntimedRecorder();
globalThis.__b9diagnostic = { staticReuserCalls: 0 };
const mod = await import(
  pathToFileURL(path.join(root, 'stages/scratch/diagnostic.mjs')).href
);
const records = [];
for (const row of [
  { id: 'siblings-3', shape: 'siblings', siblings: 3, n: 0 },
  { id: 'siblings-1000', shape: 'siblings', siblings: 1000, n: 0 },
  { id: 'oneOf-80', shape: 'oneOf', n: 80 },
  { id: 'oneOf-80-siblings-1000', shape: 'oneOf', n: 80, siblings: 1000 },
]) {
  const operation = await setupWrite(row, mod);
  const writes = [];
  for (let i = 0; i < 3; i++) {
    globalThis.__b9diagnostic.staticReuserCalls = 0;
    operation.write();
    operation.check();
    writes.push(globalThis.__b9diagnostic.staticReuserCalls);
    if (i > 0) continue;
    const partition = mod.HostStaticPartition.get(operation.root.blueprintNode);
    const plan = mod.getHostDerived(
      operation.root.blueprintNode,
    ).directChildSelectionPlan;
    records.push({
      row: row.id,
      afterWrite: 1,
      staticEntries: partition.staticEntries.length,
      gated: partition.gated,
      hasGatedOverlays: partition.hasGatedOverlays,
      directChildSelectionPlan:
        plan === null
          ? null
          : plan === undefined
            ? 'undefined'
            : { steps: plan.steps.length, baseline: plan.baseline.length },
      preparedStaticHost:
        mod.getHostDerived(operation.root).preparedStaticHost !== undefined,
      staticReuserCallbacksPerWrite: writes,
    });
  }
}
json(path.join(root, 'static-preparation.json'), { timed: false, records });
assert.equal(records[0].staticEntries, 4);
assert.equal(records[1].staticEntries, 1001);
assert.equal(records[0].directChildSelectionPlan, null);
assert.equal(records[1].preparedStaticHost, false);
assert.equal(records[3].preparedStaticHost, true);
console.log('B9_0_STATIC_PREPARATION_OK ' + JSON.stringify(records));
