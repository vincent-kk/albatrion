import type { Optional } from '@aileron/declare';

import { EMPTY_INTERSECTION } from './constant';

/**
 * Detect an impossible range without throwing a consumer-specific error.
 * @param min - Optional lower bound
 * @param max - Optional upper bound
 * @returns The empty marker for reversed bounds, otherwise undefined
 */
export const validateRange = (
  min?: number,
  max?: number,
): Optional<typeof EMPTY_INTERSECTION> =>
  min !== undefined && max !== undefined && min > max
    ? EMPTY_INTERSECTION
    : undefined;
