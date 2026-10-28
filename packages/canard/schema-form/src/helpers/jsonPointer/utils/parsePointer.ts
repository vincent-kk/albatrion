import type { PointerSegment } from '../constants/PointerOperator';
import { isAbsolutePointer } from './isAbsolutePointer';
import { parsePointerSegments } from './parsePointerSegments';

export interface ParsedPointer {
  readonly absolute: boolean;
  readonly segments: readonly PointerSegment[];
}

const RELATIVE_EMPTY: ParsedPointer = Object.freeze({
  absolute: false,
  segments: parsePointerSegments(''),
});
const ABSOLUTE_EMPTY: ParsedPointer = Object.freeze({
  absolute: true,
  segments: parsePointerSegments('#'),
});

/** Provide absolute metadata for consumers that need the cold result object. */
export const parsePointer = (
  pointer: string | readonly string[],
): ParsedPointer => {
  if (pointer === '') return RELATIVE_EMPTY;
  if (pointer === '#') return ABSOLUTE_EMPTY;
  return {
    absolute: isAbsolutePointer(pointer),
    segments: parsePointerSegments(pointer),
  };
};
