import path from 'node:path';

/**
 * Observe process CPU using the standing cumulative-counter sampler, retaining path-free rows only.
 * @param durationMs - Positive CPU averaging window
 * @param excluded - Agent and runner PID exclusions for the start gate
 * @returns Timestamped top-ten and heavy PID evidence; observation never authorizes a mid-run stop
 */
export async function observeCpu(durationMs: number, excluded: number[]) {
  const { sampleProcessCpu } = await import(
    new URL('./cpu/sampleProcessCpu.mjs', import.meta.url).href
  );
  const result = await sampleProcessCpu(durationMs);
  const rows = result.rows.map(
    (row: { pid: number; name: string; cpuPercent: number }) => ({
      ...row,
      name: path.basename(row.name),
    }),
  );
  return {
    startedAt: result.startedAt,
    endedAt: result.quietSince,
    durationSeconds: result.durationSeconds,
    top: rows.slice(0, 10),
    heavy: rows.filter(
      (row: { pid: number; cpuPercent: number }) =>
        !excluded.includes(row.pid) && row.cpuPercent > 30,
    ),
    totalPercent: rows.reduce(
      (sum: number, row: { cpuPercent: number }) => sum + row.cpuPercent,
      0,
    ),
  };
}
