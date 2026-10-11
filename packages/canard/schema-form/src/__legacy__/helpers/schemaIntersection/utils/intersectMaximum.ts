import { minLite } from '@winglet/common-utils/math';

/**
 * Select the stricter upper bound without modifying either declaration.
 * @param baseMax - Earlier optional maximum
 * @param sourceMax - Later optional maximum
 * @returns The smaller defined maximum, or undefined when both are absent
 */
export const intersectMaximum = (
  baseMax?: number,
  sourceMax?: number,
): number | undefined => {
  if (baseMax === undefined) return sourceMax;
  if (sourceMax === undefined) return baseMax;
  return minLite(baseMax, sourceMax);
};
