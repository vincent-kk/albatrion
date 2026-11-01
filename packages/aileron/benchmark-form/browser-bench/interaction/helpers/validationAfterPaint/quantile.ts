/** Median or nearest-rank quantile, with missing evidence retained as null. */
export function quantile(
  values: readonly (number | null | undefined)[],
  rank?: number,
): number | null {
  const sorted = values
    .filter(
      (value): value is number =>
        typeof value === 'number' && Number.isFinite(value),
    )
    .sort((a, b) => a - b);
  if (!sorted.length) return null;
  if (rank !== undefined)
    return sorted[Math.max(0, Math.ceil(sorted.length * rank) - 1)];
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}
