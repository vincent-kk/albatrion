import { maxLite } from '@winglet/common-utils/math';

import type { Optional } from '@aileron/declare';

/**
 * Select the stricter lower bound without modifying either declaration.
 * @param baseMin - Earlier optional minimum
 * @param sourceMin - Later optional minimum
 * @returns The larger defined minimum, or undefined when both are absent
 */
export const intersectMinimum = (
  baseMin?: number,
  sourceMin?: number,
): Optional<number> => {
  if (baseMin === undefined) return sourceMin;
  if (sourceMin === undefined) return baseMin;
  return maxLite(baseMin, sourceMin);
};
