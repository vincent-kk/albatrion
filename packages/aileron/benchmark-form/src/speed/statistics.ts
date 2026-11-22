/** Returns the nearest-rank quantile of nonempty samples. */
export function nearestRank(samples: number[], quantile: number): number {
  if (!samples.length || quantile <= 0 || quantile > 1)
    throw new Error('Invalid quantile');
  return [...samples].sort((a, b) => a - b)[
    Math.ceil(samples.length * quantile) - 1
  ];
}

/** Judges candidate ratios only when both control ratios are valid. */
export function verdict(
  candidate: number[],
  control: number[],
): 'pass' | 'over' | 'void' {
  if (
    [...candidate, ...control].some((value) => !Number.isFinite(value)) ||
    control.some((value) => value < 0.98 || value > 1.02)
  )
    return 'void';
  return candidate.some((value) => value > 1.03) ? 'over' : 'pass';
}
