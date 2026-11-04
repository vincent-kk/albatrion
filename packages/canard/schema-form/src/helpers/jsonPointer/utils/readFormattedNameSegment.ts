import type { Optional } from '@aileron/declare';

import { JSONPointer as $ } from '../constants/JSONPointer';
import { readFormattedPointerSegment } from './readFormattedPointerSegment';

/**
 * Reuse a canonical encoded name token without a decode and format round trip.
 * @param path - Canonical address, with an optional `/` or `#/` prefix.
 * @param index - Zero-based position from the start, or a negative position counted from the end (-1 is the last segment).
 * @returns The encoded segment text, or undefined when the position is outside the address or the segment is an exact raw operator token (`*`, `..`, `.`, `@`) rather than a name.
 */
export const readFormattedNameSegment = (
  path: string,
  index: number,
): Optional<string> => {
  const segment = readFormattedPointerSegment(path, index);
  switch (segment) {
    case $.Wildcard:
    case $.Parent:
    case $.Current:
    case $.Context:
      return undefined;
    default:
      return segment;
  }
};
