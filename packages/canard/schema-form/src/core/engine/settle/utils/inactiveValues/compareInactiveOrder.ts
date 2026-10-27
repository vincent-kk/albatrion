/**
 * Compare root-to-occurrence document positions without serializing them.
 * @param left - First immutable position
 * @param right - Second immutable position
 * @returns Negative, zero or positive lexicographic ordering
 */
export const compareInactiveOrder = (
  left: readonly number[],
  right: readonly number[],
): number => {
  for (let index = 0; index < Math.min(left.length, right.length); index++) {
    const difference = left[index] - right[index];
    if (difference) return difference;
  }
  return left.length - right.length;
};
