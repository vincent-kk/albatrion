// Heap-only CLI: every sample owns a fresh form; smoke never reads a clock or heap counter.
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { median } from '../b9-1/helpers/median.mjs';
import { getStageRoot } from '../window/getStageRoot.mjs';
import { collectHeap } from './helpers/collectHeap.mjs';
import { createWideBucketHeapForm } from './helpers/createWideBucketHeapForm.mjs';

process.env.NODE_ENV = 'production';
const [root, lane, historyText] = process.argv.slice(2);
const historyBuckets = Number(historyText);
const smoke = process.argv.includes('--smoke');
assert.ok(['A', 'B'].includes(lane));
assert.ok([2, 80].includes(historyBuckets));
const engine = await import(
  pathToFileURL(path.join(getStageRoot(root, lane), 'engines/dist.mjs')).href
);
const values = Array.from(
  { length: 80 },
  (_, index) => 'kind_' + (historyBuckets === 80 ? index : index % 2 ? 79 : 0),
);
const analyses = new WeakSet();
const samples = [];
let liveRoot;
let formsCreated = 0;
for (let sample = 0; sample < (smoke ? 1 : 7); sample++) {
  if (!smoke) collectHeap();
  const beforeBytes = smoke ? undefined : process.memoryUsage().heapUsed;
  liveRoot = createWideBucketHeapForm(engine, values);
  assert.ok(
    !analyses.has(liveRoot.runtime.blueprint),
    'Fresh blueprint per form',
  );
  analyses.add(liveRoot.runtime.blueprint);
  formsCreated++;
  if (!smoke) {
    collectHeap();
    const afterBytes = process.memoryUsage().heapUsed;
    samples.push({
      beforeBytes,
      afterBytes,
      retainedBytes: afterBytes - beforeBytes,
    });
  }
  // A read after collection keeps the entire form live at the measured boundary.
  assert.equal(liveRoot.value.kind, 'kind_79');
  assert.equal(liveRoot.children.length, 1003);
  liveRoot = undefined;
  if (!smoke) collectHeap();
}
console.log(
  JSON.stringify({
    timed: false,
    measurement: 'resident-heap',
    coordinator: 'msg_62de4b2d1f33',
    smoke,
    runtime: Reflect.get(globalThis, 'Bun') ? 'bun' : 'node',
    version: Reflect.get(globalThis, 'Bun')?.version ?? process.version,
    lane,
    staticFields: 1000,
    literalBranches: 80,
    historyBuckets,
    writesPerForm: 80,
    sampleCount: smoke ? 0 : 7,
    formsCreated,
    samples,
    medianBytes: smoke
      ? undefined
      : median(samples.map((sample) => sample.retainedBytes)),
    method:
      'Fresh form per sample, all active reads after every selection, GC before and after, form held through the after-GC counter; no timing or exchange contribution.',
  }),
);
