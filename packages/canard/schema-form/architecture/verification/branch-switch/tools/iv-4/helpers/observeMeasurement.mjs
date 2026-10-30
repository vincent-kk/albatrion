// IV-4 owner policy: one 30 s start observation; later CPU evidence never gates work.
import { execFileSync } from 'node:child_process';
import path from 'node:path';

import { waitForQuietProcess } from '../../window/waitForQuietProcess.mjs';

export async function observeMeasurementStart(agentPid) {
  const quiet = await waitForQuietProcess({
    agentPid,
    averageMs: 30000,
    spotlightMaxWaitMs: 30000,
  });
  return {
    approved: quiet.approved,
    waitedMs: quiet.waitedMs,
    delays: quiet.delays,
    policy: quiet.policy,
    attempts: quiet.attempts.map((attempt) => ({
      requestedDurationMs: attempt.requestedDurationMs,
      durationSeconds: attempt.durationSeconds,
      rows: attempt.rows
        .slice(0, 10)
        .map(({ pid, name, cpuPercent }) => ({ pid, name, cpuPercent })),
    })),
  };
}

export function observeMeasurementCpu(agentPid) {
  const rows = execFileSync('ps', ['-axo', 'pid,%cpu,comm'], {
    encoding: 'utf8',
  })
    .split('\n')
    .slice(1)
    .flatMap((line) => {
      const match = line.match(/^\s*(\d+)\s+([\d.]+)\s+(.+)$/);
      if (!match) return [];
      return [
        {
          pid: Number(match[1]),
          cpuPercent: Number(match[2]),
          name: path.basename(match[3]),
        },
      ];
    })
    .filter((row) => row.pid !== agentPid && row.pid !== process.pid)
    .sort((a, b) => b.cpuPercent - a.cpuPercent)
    .slice(0, 10);
  return {
    at: new Date().toISOString(),
    kind: 'ps-reported-cpu',
    gating: false,
    rows,
  };
}
