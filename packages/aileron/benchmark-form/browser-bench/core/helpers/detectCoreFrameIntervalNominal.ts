/** Supported display rates; the 16.7 ms UX budget remains independent of display cadence. */
const REFRESH_RATES_HZ = [60, 120] as const;

/**
 * Detect the nominal period of a supported compositor from its empty rAF median.
 * @param intervalMs - Observed empty-interval median in milliseconds.
 * @returns 1000 / 60 or 1000 / 120 when within 3 ms, otherwise null (not observable).
 */
export function detectCoreFrameIntervalNominal(
  intervalMs: number,
): number | null {
  const rate = REFRESH_RATES_HZ.find(
    (hz) => Math.abs(intervalMs - 1000 / hz) <= 3,
  );
  return rate === undefined ? null : 1000 / rate;
}
