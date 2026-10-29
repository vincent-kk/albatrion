import type { Optional } from '@aileron/declare';

import { JSONPointer as $ } from '../constants/JSONPointer';
import type { PointerSegment } from '../constants/PointerOperator';
import { parsePointerSegment } from './parsePointerSegment';

const EMPTY_SEGMENTS: readonly PointerSegment[] = Object.freeze([]);

/**
 * Decode an address string or an already split array into segments.
 * @param pointer - The empty string (relative, no segments), `#` (absolute root), a `/`- or `#/`-prefixed absolute address, any other relative address, or an array of raw segments whose first element may be `#`. An array is never mutated.
 * @returns Decoded names and operator symbols. For an array that needs no change the result is the input array itself, and the empty cases return a shared frozen array, so callers must not mutate it.
 */
export const parsePointerSegments = (
  pointer: string | readonly string[],
): readonly PointerSegment[] => {
  if (pointer === $.Root || pointer === $.Fragment) return EMPTY_SEGMENTS;
  if (typeof pointer !== 'string') {
    const offset = pointer[0] === $.Fragment ? 1 : 0;
    let segments: Optional<PointerSegment[]> = offset
      ? pointer.slice(offset)
      : undefined;
    for (let index = offset; index < pointer.length; index++) {
      const segment = parsePointerSegment(pointer[index]);
      if (!segments && segment !== pointer[index])
        segments = pointer.slice(offset);
      if (segments) segments[index - offset] = segment;
    }
    return segments ?? pointer;
  }
  const offset = pointer.startsWith($.Fragment + $.Separator)
    ? 2
    : pointer[0] === $.Separator
      ? 1
      : 0;
  const names = (offset ? pointer.slice(offset) : pointer).split($.Separator);
  const segments: PointerSegment[] = names;
  for (let index = 0; index < names.length; index++)
    segments[index] = parsePointerSegment(names[index]);
  return segments;
};
