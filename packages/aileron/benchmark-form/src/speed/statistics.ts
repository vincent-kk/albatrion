/** Returns the nearest-rank quantile of nonempty samples. */
export function nearestRank(samples: number[], quantile: number): number {
  if (!samples.length || quantile <= 0 || quantile > 1)
    throw new Error('Invalid quantile');
  return [...samples].sort((a, b) => a - b)[
    Math.ceil(samples.length * quantile) - 1
  ];
}
