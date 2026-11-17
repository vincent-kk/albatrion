import type { PointerSegment } from '@/schema-form/helpers/jsonPointer';

/** Validate parser-produced dense segments without allocating a second path.
 * @param segments Dense output of the pointer parser or its engine-owned cache.
 * @returns Whether the same segment array contains only concrete names.
 */
export const isNamedPointerSegments = (
  segments: readonly PointerSegment[],
): segments is readonly string[] => {
  for (const segment of segments) if (typeof segment !== 'string') return false;
  return true;
};
