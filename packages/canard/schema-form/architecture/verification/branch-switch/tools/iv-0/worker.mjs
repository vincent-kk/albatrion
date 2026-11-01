// One CLI owns one row/variant/repeat; checks and setImmediate yields stay untimed.
import assert from 'node:assert/strict';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { setImmediate } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

import { getStageRoot } from '../window/getStageRoot.mjs';
import { installDisabledHooks } from './diagnostics/installDisabledHooks.mjs';
import { createDetailRecorder } from './timing/createDetailRecorder.mjs';
import { setupFloorOperation } from './timing/setupFloorOperation.mjs';

process.env.NODE_ENV = 'production';
const [root, rowId, variant, repeatText, samplesText, warmupsText] =
  process.argv.slice(2);
const count = Number(samplesText ?? 100),
  warmups = Number(warmupsText ?? 20),
  repeat = Number(repeatText);
assert.ok(
  Number.isInteger(count) &&
    count > 0 &&
    Number.isInteger(warmups) &&
    warmups >= 0,
);
installDisabledHooks(globalThis);
const recorder = createDetailRecorder();
globalThis.__b0 = recorder;
const files = {
  plain: path.join(root, 'diagnostics/plain.mjs'),
  details: path.join(root, 'diagnostics/details.mjs'),
  unwrapped: path.join(getStageRoot(root, 'B'), 'stages/scratch/unwrapped.mjs'),
  wrapped: path.join(getStageRoot(root, 'B'), 'stages/scratch/wrapped.mjs'),
};
const operations = {};
for (const [mode, file] of Object.entries(files))
  operations[mode] = await setupFloorOperation(
    rowId,
    variant,
    await import(pathToFileURL(file).href),
  );
const modes = Object.keys(files);
const samples = Object.fromEntries(modes.map((mode) => [mode, []]));
const stages = { details: [], wrapped: [] },
  scoped = [];
for (let index = -warmups; index < count; index++) {
  const offset = (index + warmups + repeat) % modes.length;
  for (const mode of [...modes.slice(offset), ...modes.slice(0, offset)]) {
    await setImmediate();
    recorder.reset();
    recorder.enabled = mode === 'details' || mode === 'wrapped';
    const start = performance.now();
    operations[mode].write();
    const elapsed = (performance.now() - start) * 1000;
    recorder.enabled = false;
    operations[mode].check();
    if (index < 0) continue;
    samples[mode].push(elapsed);
    if (!['details', 'wrapped'].includes(mode)) continue;
    const metrics = structuredClone(recorder.metrics);
    const self = Object.values(metrics).reduce(
      (sum, metric) => sum + metric.selfUs,
      0,
    );
    assert.ok(elapsed - self >= -0.01, 'Nested self cost fits measured write');
    metrics.everythingElse = {
      selfUs: elapsed - self,
      inclusiveUs: elapsed - self,
      calls: 1,
    };
    stages[mode].push(metrics);
    if (mode === 'details') scoped.push(structuredClone(recorder.scoped));
  }
}
console.log(
  JSON.stringify({
    row: rowId,
    variant,
    repeat,
    pid: process.pid,
    node: process.version,
    warmups,
    sampleCount: count,
    samples,
    stages,
    scoped,
  }),
);
