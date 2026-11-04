/** Canonical decimal segments exclude leading zeros and named array properties. */
const CANONICAL_ARRAY_INDEX = /^(0|[1-9]\d*)$/;

/**
 * Identify a canonical decimal array slot in a JSON Pointer path.
 * @param segment - Decoded path segment; no numeric upper bound is imposed
 * @returns Whether the segment is zero or a positive decimal without leading zeros
 */
export const isCanonicalArrayIndex = (segment: string): boolean =>
  CANONICAL_ARRAY_INDEX.test(segment);
