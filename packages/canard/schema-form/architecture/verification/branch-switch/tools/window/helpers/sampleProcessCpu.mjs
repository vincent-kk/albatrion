import { execFileSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { setTimeout } from 'node:timers/promises';

import { parseCpuSample } from '../../../../design-optimization/tools/profile/branch-switch/parseCpuSample.mjs';

/**
 * Observe external process CPU from cumulative counters over the requested interval.
 * @param {number} durationMs Positive averaging interval; the final B8 policy supplies 3000.
 * @returns {Promise<object>} Timestamped process rows, excluding this observer, with raw ps evidence.
 */
export async function sampleProcessCpu(durationMs = 3000) {
  const startedAt = new Date().toISOString();
  const started = performance.now();
  const before = execFileSync('ps', ['-axo', 'pid,ppid,%cpu,time,comm'], {
    encoding: 'utf8',
  });
  await setTimeout(durationMs);
  const after = execFileSync('ps', ['-axo', 'pid,ppid,%cpu,time,comm'], {
    encoding: 'utf8',
  });
  const durationSeconds = (performance.now() - started) / 1000;
  const a = parseCpuSample(before),
    b = parseCpuSample(after);
  const rows = [...b]
    .filter(([pid]) => a.has(pid) && pid !== process.pid)
    .map(([pid, value]) => ({
      pid,
      name: value.name,
      cpuPercent:
        (Math.max(0, value.seconds - a.get(pid).seconds) / durationSeconds) *
        100,
    }))
    .sort((left, right) => right.cpuPercent - left.cpuPercent);
  return {
    startedAt,
    quietSince: new Date().toISOString(),
    durationSeconds,
    requestedDurationMs: durationMs,
    rows,
    before,
    after,
  };
}
