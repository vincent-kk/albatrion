/**
 * Summarize the probe's empty rAF gaps without rounding the display period.
 * @param values - Nonempty finite gaps in milliseconds.
 * @returns Arithmetic median; the probe always supplies its observed 10-second window.
 */
export function medianCoreProbeGaps(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}
