import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { setTimeout } from 'node:timers/promises';

import { sampleProcessCpu } from './helpers/sampleProcessCpu.mjs';

/**
 * Wait before measurement, with independent ordinary and Spotlight allowances.
 * @param {object} options Agent PID, time budgets and injectable clock effects.
 * @returns {Promise<object>} Approval and complete start-delay evidence; never retries a sample.
 */
export async function waitForQuietProcess({
  agentPid,
  sample = sampleProcessCpu,
  pause = setTimeout,
  now = () => performance.now(),
  averageMs = 3000,
  maxWaitMs = 120000,
  spotlightMaxWaitMs = 600000,
}) {
  assert.ok(Number.isSafeInteger(agentPid) && agentPid > 0);
  const started = now(),
    attempts = [],
    delays = [];
  let approved = false,
    ordinaryWaitedMs = 0;
  for (;;) {
    const sampleStarted = now();
    const observation = await sample(averageMs);
    observation.heavy = observation.rows.filter(
      (row) => row.pid !== agentPid && row.cpuPercent > 30,
    );
    attempts.push(observation);
    if (!observation.heavy.length) {
      approved = true;
      break;
    }
    const ordinary = observation.heavy.some(
      (row) =>
        row.name !== 'mds' &&
        row.name !== 'mds_stores' &&
        !row.name.startsWith('mdworker'),
    );
    if (ordinary) ordinaryWaitedMs += now() - sampleStarted;
    const elapsed = now() - started;
    const remaining = Math.min(
      ordinary &&
        observation.heavy.every(
          (row) =>
            row.name !== 'mds' &&
            row.name !== 'mds_stores' &&
            !row.name.startsWith('mdworker'),
        )
        ? Infinity
        : spotlightMaxWaitMs - elapsed,
      ordinary ? maxWaitMs - ordinaryWaitedMs : Infinity,
    );
    const delay = remaining < averageMs + 5000 ? Math.max(0, remaining) : 5000;
    if (delay > 0) {
      delays.push(delay);
      await pause(delay);
      if (ordinary) ordinaryWaitedMs += delay;
    }
    if (remaining < averageMs + 5000) break;
  }
  return {
    ...attempts.at(-1),
    approved,
    attempts,
    delays,
    waitCount: delays.length,
    waitedMs: now() - started,
    ordinaryWaitedMs,
    excludedAgentPid: agentPid,
    policy: {
      averageMs,
      retryDelayMs: 5000,
      maxWaitMs,
      spotlightMaxWaitMs,
      maximumExternalCpuPercent: 30,
    },
  };
}
