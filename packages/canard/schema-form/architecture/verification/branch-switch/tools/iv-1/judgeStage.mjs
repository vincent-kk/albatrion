/** Judge stage medians with the owner's sub-two-microsecond resolution rule. */
export function judgeStage(row, name, baseline, candidate) {
  const A = baseline.median;
  const B = candidate.median;
  const widthUs = baseline.max - baseline.min;
  const criterion =
    A === 0
      ? row === 'single-nested-d6-f4' && name === 'selectChildren'
        ? 'approved-zero'
        : 'unobserved'
      : A < 2
        ? 'within-A-spread'
        : 'decrease';
  const passed =
    criterion === 'approved-zero'
      ? B === 0
      : criterion === 'unobserved'
        ? false
        : criterion === 'within-A-spread'
          ? B - A <= widthUs
          : B < A;
  return { name, A, B, widthUs, criterion, passed };
}
