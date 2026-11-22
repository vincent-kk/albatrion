/** Calculates candidate and control ratios against the same baseline. */
export function ratios(a1: number, a2: number, candidate: number) {
  return { candidate: candidate / a1, control: a2 / a1 };
}
