/**
 * Compare root-to-leaf document positions, then paths for equal positions.
 * @param left - First occurrence's numeric entry chain
 * @param right - Second occurrence's numeric entry chain
 * @param leftPath - First public path when positions are equal
 * @param rightPath - Second public path when positions are equal
 * @returns Negative, zero or positive according to public enumeration order
 */
export const compareInactiveOrder = (
  left: readonly number[],
  right: readonly number[],
  leftPath = '',
  rightPath = '',
): number => {
  for (
    let i = 0, length = Math.min(left.length, right.length);
    i < length;
    i++
  ) {
    const difference = left[i] - right[i];
    if (difference) return difference;
  }
  return (
    left.length - right.length ||
    (leftPath < rightPath ? -1 : leftPath > rightPath ? 1 : 0)
  );
};
