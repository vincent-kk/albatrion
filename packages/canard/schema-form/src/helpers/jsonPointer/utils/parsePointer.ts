import { JSONPointer as $ } from '../constants/JSONPointer';
import type { PointerSegment } from '../constants/PointerOperator';
import { isAbsolutePointer } from './isAbsolutePointer';
import { parsePointerSegments } from './parsePointerSegments';

/** Parsed address with its absoluteness. */
export interface ParsedPointer {
  /** Whether the address was absolute (`#`, `/…` or `#/…`, or an array starting with `#`). */
  readonly absolute: boolean;
  /** Decoded names and operator symbols; callers must not mutate the array. */
  readonly segments: readonly PointerSegment[];
}

const RELATIVE_EMPTY: ParsedPointer = Object.freeze({
  absolute: false,
  segments: parsePointerSegments($.Root),
});
const ABSOLUTE_EMPTY: ParsedPointer = Object.freeze({
  absolute: true,
  segments: parsePointerSegments($.Fragment),
});

/**
 * Parse an address together with its absoluteness, for consumers off the hot path.
 * @param pointer - Address string or array of raw segments, as accepted by parsePointerSegments.
 * @returns The absolute flag and decoded segments. The empty string and `#` return shared frozen results.
 */
export const parsePointer = (
  pointer: string | readonly string[],
): ParsedPointer => {
  if (pointer === $.Root) return RELATIVE_EMPTY;
  if (pointer === $.Fragment) return ABSOLUTE_EMPTY;
  return {
    absolute: isAbsolutePointer(pointer),
    segments: parsePointerSegments(pointer),
  };
};
