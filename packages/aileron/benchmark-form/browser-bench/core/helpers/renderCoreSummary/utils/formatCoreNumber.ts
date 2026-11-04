/**
 * Format an observed numeric cell at fixed decimal precision.
 * @param value - Milliseconds, counts or ratios; null and undefined denote missing evidence.
 * @param digits - Number of fractional decimal places, defaulting to three.
 * @returns A fixed-point value or an em dash for missing evidence.
 */
export const formatCoreNumber = (
  value: number | null | undefined,
  digits = 3,
) => (value === null || value === undefined ? '—' : value.toFixed(digits));
