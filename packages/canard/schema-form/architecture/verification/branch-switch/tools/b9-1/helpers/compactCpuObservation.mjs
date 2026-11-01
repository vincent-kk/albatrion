import { compactProcessRows } from './compactProcessRows.mjs';

/** Retain timing and threshold evidence without executable paths or full process tables. */
export function compactCpuObservation(sample) {
  return {
    startedAt: sample.startedAt,
    quietSince: sample.quietSince,
    durationSeconds: sample.durationSeconds,
    requestedDurationMs: sample.requestedDurationMs,
    heavyCount: sample.heavyCount ?? sample.heavy?.length ?? 0,
    heavy: (sample.heavy ?? [])
      .slice(0, 10)
      .map(({ name, cpuPercent }) => ({ name, cpuPercent })),
    rows: compactProcessRows(sample),
  };
}
