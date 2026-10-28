import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { setTimeout } from 'node:timers/promises';

import { sampleProcessCpu } from './sampleProcessCpu.mjs';

/**
 * Delay one process start until external CPU is quiet, without repeating any measurement.
 * @param {object} options Explicit agent PID and injectable observation, pause and clock effects.
 * @returns {Promise<object>} Every observation, delay count and approval; timeout preserves evidence and returns false.
 */
export async function waitForQuietProcess({
  agentPid,
  sample = sampleProcessCpu,
  pause = setTimeout,
  now = () => performance.now(),
  maxWaitMs = 120000,
}) {
  assert.ok(Number.isSafeInteger(agentPid) && agentPid > 0);
  const started = now(),
    attempts = [],
    delays = [];
  let approved = false;
  for (;;) {
    const observation = await sample(3000);
    observation.heavy = observation.rows.filter(
      (row) => row.pid !== agentPid && row.cpuPercent > 30,
    );
    attempts.push(observation);
    if (!observation.heavy.length) {
      approved = true;
      break;
    }
    const remaining = maxWaitMs - (now() - started);
    if (remaining < 8000) {
      if (remaining > 0) {
        delays.push(remaining);
        await pause(remaining);
      }
      break;
    }
    delays.push(5000);
    await pause(5000);
  }
  return {
    ...attempts.at(-1),
    approved,
    attempts,
    delays,
    waitCount: delays.length,
    waitedMs: now() - started,
    excludedAgentPid: agentPid,
    policy: {
      averageMs: 3000,
      retryDelayMs: 5000,
      maxWaitMs,
      maximumExternalCpuPercent: 30,
    },
  };
}
