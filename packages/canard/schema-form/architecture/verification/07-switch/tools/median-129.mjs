/**
 * Median of the 129 statistics: the middle value, or the mean of the two middle values when the count is even.
 * @param values - Non-empty array of finite numbers; not mutated
 * @returns The median
 */
export function median129(values) {
  const sorted = values.toSorted((a, b) => a - b), middle = sorted.length >> 1;
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
