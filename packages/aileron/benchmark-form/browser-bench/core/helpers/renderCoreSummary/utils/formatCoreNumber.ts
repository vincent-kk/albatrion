/** Fixed-point cell; a missing value renders as an em dash. */
export const formatCoreNumber = (
  value: number | null | undefined,
  digits = 3,
) => (value === null || value === undefined ? '—' : value.toFixed(digits));
