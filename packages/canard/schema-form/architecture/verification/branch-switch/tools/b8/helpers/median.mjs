/** Derive the process-level statistic without changing the retained raw samples. */
export function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[index]
    : (sorted[index - 1] + sorted[index]) / 2;
}
