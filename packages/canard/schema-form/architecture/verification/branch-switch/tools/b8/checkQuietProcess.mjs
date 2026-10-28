// Synthetic clocks only; this check never takes performance samples or waits on the OS.
import assert from 'node:assert/strict';

import { waitForQuietProcess } from './helpers/waitForQuietProcess.mjs';

let time = 0;
const durations = [],
  pauses = [];
const recovered = await waitForQuietProcess({
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
assert.equal(recovered.approved, true);
assert.equal(recovered.waitCount, 1);
assert.deepEqual(durations, [3000, 3000]);
assert.deepEqual(pauses, [5000]);
assert.equal(recovered.attempts[0].heavy[0].name, 'daemon');
assert.equal(recovered.attempts[1].heavy.length, 0);

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
