import { execFileSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { setTimeout } from 'node:timers/promises';

import { parseCpuSample } from './parseCpuSample.mjs';

/** Sample cumulative CPU counters for five seconds; the coordinator owns quiet-window authorization. */
export async function sampleWindow() {
  const startedAt = new Date().toISOString();
  const start = performance.now();
  const before = execFileSync('ps', ['-axo', 'pid,ppid,%cpu,time,comm'], {
    encoding: 'utf8',
  });
  await setTimeout(5000);
  const after = execFileSync('ps', ['-axo', 'pid,ppid,%cpu,time,comm'], {
    encoding: 'utf8',
  });
  const durationSeconds = (performance.now() - start) / 1000;
  const a = parseCpuSample(before);
  const b = parseCpuSample(after);
  const rows = [...b]
    .filter(([pid]) => a.has(pid) && pid !== process.pid)
    .map(([pid, value]) => ({
      pid,
      name: value.name,
      cpuPercent:
        (Math.max(0, value.seconds - a.get(pid).seconds) / durationSeconds) *
        100,
    }))
    .sort((l, r) => r.cpuPercent - l.cpuPercent);
  const heavy = rows.filter(
    (r) =>
      r.cpuPercent >= 50 ||
      (r.name.includes('mds_stores') && r.cpuPercent >= 10) ||
      (['node', 'bun', 'vitest', 'tsc', 'rolldown'].includes(r.name) &&
        r.cpuPercent >= 10),
  );
  return {
    startedAt,
    quietSince: new Date().toISOString(),
    durationSeconds,
    rows,
    heavy,
    before,
    after,
  };
}
