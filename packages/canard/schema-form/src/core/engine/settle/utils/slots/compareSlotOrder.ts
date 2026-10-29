import { minLite } from '@winglet/common-utils/math';

/**
 * Compare two materialized candidates in blueprint document order.
 * @param left - Root-to-candidate occurrence positions
 * @param right - Root-to-candidate occurrence positions
 * @returns Negative, zero, or positive according to lexicographic order
 */
export const compareSlotOrder = (
  left: readonly number[],
  right: readonly number[],
): number => {
  for (let index = 0; index < minLite(left.length, right.length); index++) {
    const difference = left[index] - right[index];
    if (difference) return difference;
  }
  return left.length - right.length;
};
