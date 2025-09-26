import { lcm } from '@winglet/common-utils/math';

/**
 * Intersects multipleOf constraints by calculating their least common multiple (LCM).
 *
 * This function combines two multipleOf constraints by finding their LCM,
 * ensuring that the result is a multiple of both original values.
 * This creates the most restrictive valid constraint.
 *
 * @param baseMultiple - The base multipleOf value (optional)
 * @param sourceMultiple - The source multipleOf value (optional)
 * @returns LCM of both values, or undefined if both are undefined
 */
export function intersectMultipleOf(
  baseMultiple?: number,
  sourceMultiple?: number,
): number | undefined {
  if (baseMultiple === undefined && sourceMultiple === undefined)
    return undefined;
  if (baseMultiple === undefined) return sourceMultiple;
  if (sourceMultiple === undefined) return baseMultiple;
  return lcm(baseMultiple, sourceMultiple);
}
