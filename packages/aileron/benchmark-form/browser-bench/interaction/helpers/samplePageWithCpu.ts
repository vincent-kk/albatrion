import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Browser } from 'playwright';

import { readMeasurementPids } from './readMeasurementPids';
import { samplePage } from './samplePage';

/** Measure one fresh page with cumulative external CPU counters covering that exact page sequence. */
export async function samplePageWithCpu(
  browser: Browser,
  root: string,
  lane: string,
  id: string,
) {
  const { parseCpuSample } = await import(
    pathToFileURL(
      path.resolve(
        '../../canard/schema-form/architecture/verification/design-optimization/tools/profile/branch-switch/parseCpuSample.mjs',
      ),
    ).href
  );
  const startedAt = new Date().toISOString();
  const started = performance.now();
  const before: Map<number, { name: string; seconds: number }> = parseCpuSample(
    execFileSync('ps', ['-axo', 'pid,ppid,%cpu,time,comm'], {
      encoding: 'utf8',
    }),
  );
  const page = await samplePage(browser, root, lane, id);
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
