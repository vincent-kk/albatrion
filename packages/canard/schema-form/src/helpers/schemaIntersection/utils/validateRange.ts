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
): typeof EMPTY_INTERSECTION | undefined =>
  min !== undefined && max !== undefined && min > max
    ? EMPTY_INTERSECTION
    : undefined;
