import type { CoreStatistics } from '../reportTypes';

/**
 * Summarize one nonempty set of finite, nonnegative durations.
 * @param values - Milliseconds per operation, or per write for typing.
 * @returns Median, nearest-rank p95, max and count; throws for absent or invalid evidence.
 */
export function summarizeCoreSamples(
  values: readonly number[],
): CoreStatistics {
  if (
    !values.length ||
    values.some((value) => !Number.isFinite(value) || value < 0)
  )
    throw new Error('Core samples must be nonempty, finite and nonnegative');
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return {
    medianMs:
      sorted.length % 2
        ? sorted[middle]
        : (sorted[middle - 1] + sorted[middle]) / 2,
    p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1],
    maxMs: sorted[sorted.length - 1],
    samples: sorted.length,
  };
}
