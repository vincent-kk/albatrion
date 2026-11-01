/** Summarize finite diagnostic observations with the registered nearest-rank p95 convention. */
export function quantiles(values) {
  const sorted = values
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  const count = sorted.length;
  return {
    count,
    median: count
      ? count % 2
        ? sorted[count >> 1]
        : (sorted[count / 2 - 1] + sorted[count / 2]) / 2
      : null,
    p95: count ? sorted[Math.ceil(count * 0.95) - 1] : null,
  };
}
