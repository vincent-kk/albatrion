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
