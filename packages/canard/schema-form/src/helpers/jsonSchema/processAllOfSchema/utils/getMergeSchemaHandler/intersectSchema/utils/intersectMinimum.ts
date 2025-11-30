import { maxLite } from '@winglet/common-utils/math';

/**
 * Intersects minimum constraints by selecting the larger (more restrictive) value.
 *
 * This function combines minimum value constraints by choosing the maximum of the two values.
 * This creates the most restrictive lower bound that satisfies both constraints.
 *
 * @param baseMin - The base minimum value (optional)
 * @param sourceMin - The source minimum value (optional)
 * @returns The larger minimum value, or undefined if both are undefined
 */
export const intersectMinimum = (
  baseMin?: number,
  sourceMin?: number,
): number | undefined => {
  if (baseMin === undefined && sourceMin === undefined) return undefined;
  if (baseMin === undefined) return sourceMin;
  if (sourceMin === undefined) return baseMin;
  return maxLite(baseMin, sourceMin);
};
