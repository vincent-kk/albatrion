import { lcm } from '@winglet/common-utils/math';

import type { Optional } from '@aileron/declare';

/**
 * Intersect finite multiple constraints through the existing LCM policy.
 * @param baseMultiple - Earlier multiple; non-finite numbers are absent
 * @param sourceMultiple - Later multiple; non-finite numbers are absent
 * @returns Their LCM, the only finite constraint, or undefined
 */
export const intersectMultipleOf = (
  baseMultiple?: number,
  sourceMultiple?: number,
): Optional<number> => {
  const base = Number.isFinite(baseMultiple) ? baseMultiple : undefined;
  const source = Number.isFinite(sourceMultiple) ? sourceMultiple : undefined;
  if (base === undefined) return source;
  if (source === undefined) return base;
  return lcm(base, source);
};
