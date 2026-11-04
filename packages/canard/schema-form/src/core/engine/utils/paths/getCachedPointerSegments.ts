import {
  type PointerSegment,
  parsePointerSegments,
} from '@/schema-form/helpers/jsonPointer';

import { getHostDerived } from '../cache/derivedRecords';

const POINTER_SEGMENT_LIMIT = 256;
type PointerSegments = Map<string, readonly PointerSegment[]>;

/**
 * Reuse decoded segments of concrete addresses within one runtime.
 * @param runtime - Runtime identity that owns the cache; a different identity never shares entries.
 * @param path - Canonical concrete address as accepted by parsePointerSegments.
 * @returns The decoded segments, identical in identity on a hit. At most 256 addresses are kept; the oldest is evicted first, and callers must not mutate the result.
 */
export const getCachedPointerSegments = (
  runtime: object,
  path: string,
): readonly PointerSegment[] => {
  const derived = getHostDerived<'pointerSegments', PointerSegments>(runtime);
  const cache = (derived.pointerSegments ??= new Map());
  let segments = cache.get(path);
  if (segments === undefined) {
    segments = parsePointerSegments(path);
    if (cache.size === POINTER_SEGMENT_LIMIT) {
      const oldest = cache.keys().next();
      if (!oldest.done) cache.delete(oldest.value);
    }
    cache.set(path, segments);
  }
  return segments;
};
