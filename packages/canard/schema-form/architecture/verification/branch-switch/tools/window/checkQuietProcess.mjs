// Synthetic clock checks; no OS wait and no benchmark samples are taken.
import assert from 'node:assert/strict';

import { observeQuietProcess } from './checkQuietProcess/utils/observeQuietProcess.mjs';
import { getStageRoot } from './getStageRoot.mjs';
import { waitForQuietProcess } from './helpers/waitForQuietProcess.mjs';

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

let time = 0;
const durations = [],
  pauses = [];
const intervalRecovered = await waitForQuietProcess({
  agentPid: 99,
  now: () => time,
  pause: async (ms) => {
    pauses.push(ms);
    time += ms;
  },
  sample: async (ms) => {
    durations.push(ms);
    time += ms;
    return {
      rows: [
        { pid: 99, name: 'own-agent', cpuPercent: 200 },
        { pid: 2, name: 'daemon', cpuPercent: durations.length === 1 ? 51 : 5 },
      ],
    };
  },
});
assert.equal(intervalRecovered.approved, true);
assert.equal(intervalRecovered.waitCount, 1);
assert.deepEqual(durations, [3000, 3000]);
assert.deepEqual(pauses, [5000]);
assert.equal(intervalRecovered.attempts[0].heavy[0].name, 'daemon');
assert.equal(intervalRecovered.attempts[1].heavy.length, 0);

time = 0;
const failed = await waitForQuietProcess({
  agentPid: 99,
  now: () => time,
  pause: async (ms) => {
    time += ms;
  },
  sample: async (ms) => {
    time += ms;
    return { rows: [{ pid: 2, name: 'daemon', cpuPercent: 51 }] };
  },
});
assert.equal(failed.approved, false);
assert.equal(time, 120000);
assert.ok(failed.attempts.length > 1);
assert.equal(failed.waitedMs, 120000);
console.log('B8_QUIET_PROCESS_OK');

for (const [name, cpuPercent, approved, expected] of [
  ['mds_stores', 5, true, 30000],
  ['mds_stores', 51, false, 30000],
  ['daemon', 51, false, 120000],
]) {
  time = 0;
  const observed = [];
  const result = await waitForQuietProcess({
    agentPid: 99,
    averageMs: 30000,
    spotlightMaxWaitMs: 30000,
    now: () => time,
    pause: async (ms) => {
      time += ms;
    },
    sample: async (ms) => {
      observed.push(ms);
      time += ms;
      return { rows: [{ pid: 2, name, cpuPercent }] };
    },
  });
  assert.equal(result.approved, approved);
  assert.equal(time, expected);
  assert.ok(observed.every((duration) => duration === 30000));
  assert.equal(result.policy.averageMs, 30000);
}
console.log('IV_4_START_QUIET_OK');
