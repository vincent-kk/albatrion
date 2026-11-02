import { execFileSync } from 'node:child_process';
import type { Browser } from 'playwright';

import { readMeasurementPids } from './readMeasurementPids';
import { samplePage } from './samplePage';

/** Measure one fresh page with cumulative external CPU counters covering that exact page sequence. */
export async function samplePageWithCpu(
  browser: Browser,
  root: string,
  lane: string,
  id: string,
  sampler: typeof samplePage = samplePage,
) {
  const { parseCpuSample } = await import(
    new URL('./cpu/parseCpuSample.mjs', import.meta.url).href
  );
  const startedAt = new Date().toISOString();
  const started = performance.now();
  const before: Map<number, { name: string; seconds: number }> = parseCpuSample(
    execFileSync('ps', ['-axo', 'pid,ppid,%cpu,time,comm'], {
      encoding: 'utf8',
    }),
  );
  const page = await sampler(browser, root, lane, id);
  const after: Map<number, { name: string; seconds: number }> = parseCpuSample(
    execFileSync('ps', ['-axo', 'pid,ppid,%cpu,time,comm'], {
      encoding: 'utf8',
    }),
  );
  const durationSeconds = (performance.now() - started) / 1000;
  const excluded = readMeasurementPids();
  const rows = [...after]
    .filter(([pid]) => before.has(pid))
    .map(([pid, value]) => ({
      pid,
      name: value.name,
      cpuPercent:
        (Math.max(0, value.seconds - before.get(pid)!.seconds) /
          durationSeconds) *
        100,
    }))
    .sort((a, b) => b.cpuPercent - a.cpuPercent);
  return {
    ...page,
    externalCpu: {
      startedAt,
      endedAt: new Date().toISOString(),
      durationSeconds,
      excluded,
      rows: rows.filter((row) => !excluded.includes(row.pid)),
    },
  };
}
