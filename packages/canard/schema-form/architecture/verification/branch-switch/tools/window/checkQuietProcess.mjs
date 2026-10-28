// Synthetic clock checks; no OS wait and no benchmark samples are taken.
import assert from 'node:assert/strict';

import { observeQuietProcess } from './checkQuietProcess/utils/observeQuietProcess.mjs';
import { getStageRoot } from './getStageRoot.mjs';

const ordinary = await observeQuietProcess(() => [
  { pid: 1, name: 'daemon', cpuPercent: 50 },
]);
assert.equal(ordinary.approved, false);
assert.equal(ordinary.waitedMs, 120000);
for (const name of ['mds', 'mds_stores', 'mdworker', 'mdworker_shared']) {
  const result = await observeQuietProcess(() => [
    { pid: 1, name, cpuPercent: 50 },
  ]);
  assert.equal(result.approved, false);
  assert.equal(result.waitedMs, 600000, name);
  assert.equal(result.ordinaryWaitedMs, 0, name);
}
const recovered = await observeQuietProcess((time) =>
  time < 180000 ? [{ pid: 1, name: 'mds', cpuPercent: 50 }] : [],
);
assert.equal(recovered.approved, true);
assert.ok(recovered.waitedMs > 120000 && recovered.waitedMs < 600000);
const mixed = await observeQuietProcess(() => [
  { pid: 1, name: 'mds', cpuPercent: 50 },
  { pid: 2, name: 'daemon', cpuPercent: 50 },
]);
assert.equal(mixed.approved, false);
assert.equal(mixed.waitedMs, 120000);
const laterOrdinary = await observeQuietProcess((time) => [
  { pid: 1, name: time < 160000 ? 'mds' : 'daemon', cpuPercent: 50 },
]);
assert.equal(laterOrdinary.approved, false);
assert.equal(laterOrdinary.ordinaryWaitedMs, 120000);
assert.ok(laterOrdinary.waitedMs > 120000 && laterOrdinary.waitedMs <= 600000);
const unrelated = await observeQuietProcess(() => [
  { pid: 1, name: 'mds-helper', cpuPercent: 50 },
]);
assert.equal(unrelated.waitedMs, 120000);
const own = await observeQuietProcess(() => [
  { pid: 99, name: 'mds', cpuPercent: 200 },
]);
assert.equal(own.approved, true);
assert.equal(own.waitCount, 0);
assert.equal(
  getStageRoot('/device/run.noindex', 'A'),
  '/device/run-stage-a.noindex',
);
assert.equal(getStageRoot('/device/run', 'B'), '/device/run-stage-b');
console.log(
  'WINDOW_QUIET_PROCESS_OK ordinary=120000 spotlight=600000 mixed=120000 legacy-paths=preserved',
);
