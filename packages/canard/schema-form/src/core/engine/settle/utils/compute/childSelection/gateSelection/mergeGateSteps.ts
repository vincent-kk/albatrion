/**
 * Merge sorted visit lists while retaining each authored position once.
 * @param left - Ascending already selected positions
 * @param right - Ascending additional positions; may contain adjacent duplicates
 * @returns Ascending union in time proportional to the two lists
 */
export const mergeGateSteps = (
  left: readonly number[],
  right: readonly number[],
): number[] => {
  const merged: number[] = [];
  let a = 0;
  let b = 0;
  while (a < left.length || b < right.length) {
    const next =
      b >= right.length || (a < left.length && left[a] <= right[b])
        ? left[a++]
        : right[b++];
    if (merged[merged.length - 1] !== next) merged.push(next);
  }
  return merged;
};
