import {
  type PointerSegment,
  parsePointerSegments,
} from '@/schema-form/helpers/jsonPointer';

import { getHostDerived } from '../cache/derivedRecords';

const POINTER_SEGMENT_LIMIT = 256;
type PointerSegments = Map<string, readonly PointerSegment[]>;

/** Reuse concrete syntax within a runtime, bounding historical addresses with FIFO eviction. */
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
