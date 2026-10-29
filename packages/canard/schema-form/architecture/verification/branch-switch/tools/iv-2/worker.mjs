// CLI process owns one row/pass; construction and assertions are never timed.
import assert from 'node:assert/strict';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';

import { createSlotRecorder } from '../b4-2/recorder.mjs';
import { createUntimedRecorder } from '../b9-0/untimedRecorder.mjs';
import { yieldBeforeSample } from '../b9-0/yieldBeforeSample.mjs';
import { setupWrite } from '../iv-1/operation.mjs';
import { createScopedRecorder } from './helpers/createScopedRecorder.mjs';
import { rows } from './rows.mjs';

process.env.NODE_ENV = 'production';
const [root, rowId, pass, repeatText, warmupsText = '20', samplesText = '100'] =
  process.argv.slice(2);
const warmups = Number(warmupsText),
  sampleCount = Number(samplesText);
const smoke = pass === 'smoke';
const smokeMode = repeatText;
const row = rows.find((row) => row.id === rowId);
assert.ok(row);

const modeFiles = {
  dist: 'engines/dist.mjs',
  legacy: 'engines/legacy.mjs',
  unwrapped: 'stages/scratch/unwrapped.mjs',
  wrapped: 'stages/scratch/wrapped.mjs',
  supplemental: 'stages/scratch/supplemental.mjs',
  gap: 'stages/scratch/gap.mjs',
  diagnostic: 'stages/scratch/diagnostic.mjs',
};
const modes = smoke
  ? [smokeMode]
  : pass === 'supplemental'
    ? ['unwrapped', 'supplemental']
    : pass === 'gap'
      ? ['unwrapped', 'gap']
      : ['dist', 'unwrapped', 'wrapped', 'legacy'];
const recorder = smoke
  ? createUntimedRecorder()
  : pass === 'ledger'
    ? createSlotRecorder()
    : createScopedRecorder();
globalThis.__b0 = recorder;
globalThis.__b9diagnostic = { staticReuserCalls: 0 };
const operations = {};
for (const mode of modes)
  operations[mode] = await setupWrite(
    row,
    await import(pathToFileURL(path.join(root, modeFiles[mode])).href),
    mode === 'legacy',
  );
if (smoke) {
  recorder.enabled = true;
  operations[smokeMode].write();
  if (smokeMode === 'legacy') await operations[smokeMode].settle();
  operations[smokeMode].check();
  console.log(
    JSON.stringify({
      row: rowId,
      mode: smokeMode,
      pid: process.pid,
      timed: false,
      counts: recorder.metrics,
    }),
  );
} else {
  const samples = Object.fromEntries(modes.map((mode) => [mode, []]));
  const stages = [],
    scoped = [],
    gaps = [];
  const repeat = Number(repeatText);
  for (let index = -warmups; index < sampleCount; index++) {
    const offset = (index + warmups + repeat) % modes.length;
    for (const mode of [...modes.slice(offset), ...modes.slice(0, offset)]) {
      await yieldBeforeSample();
      recorder.reset();
      recorder.enabled = ['wrapped', 'supplemental', 'gap'].includes(mode);
      const start = performance.now();
      operations[mode].write();
      if (mode === 'legacy') await operations[mode].settle();
      const elapsed = (performance.now() - start) * 1000;
      recorder.enabled = false;
      operations[mode].check();
      if (index < 0) continue;
      samples[mode].push(elapsed);
      if (!['wrapped', 'supplemental', 'gap'].includes(mode)) continue;
      const self = Object.values(recorder.metrics).reduce(
        (sum, metric) => sum + metric.selfUs,
        0,
      );
      assert.ok(elapsed - self >= -0.01, 'Nested self fits within row');
      stages.push({
        ...structuredClone(recorder.metrics),
        everythingElse: {
          selfUs: elapsed - self,
          inclusiveUs: elapsed - self,
          calls: 1,
        },
      });
      scoped.push(structuredClone(recorder.scoped ?? {}));
      if (mode === 'gap')
        gaps.push({
          beforeSettlementUs: (recorder.writeStart - start) * 1000,
          deliveryUs: recorder.metrics.runDeliveryWaves?.inclusiveUs ?? 0,
          subscriberWaveUs: recorder.metrics.deliverWave?.inclusiveUs ?? 0,
        });
    }
  }
  console.log(
    JSON.stringify({
      row: rowId,
      pass,
      repeat,
      pid: process.pid,
      node: process.version,
      warmups,
      sampleCount,
      samples,
      stages,
      scoped,
      gaps,
    }),
  );
}
