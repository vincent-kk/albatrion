import type { PointerSegment } from '../constants/PointerOperator';
import { parsePointerSegment } from './parsePointerSegment';
import { readFormattedPointerSegment } from './readFormattedPointerSegment';

/**
 * Decode only the requested segment, retaining operator identity.
 * @param path - Canonical address, with an optional `/` or `#/` prefix.
 * @param index - Zero-based position from the start, or a negative position counted from the end (-1 is the last segment).
 * @returns The decoded name or operator symbol, or undefined for the root or a position outside the address.
 */
export const readPointerSegment = (
  path: string,
  index: number,
): PointerSegment | undefined => {
  const segment = readFormattedPointerSegment(path, index);
  return segment === undefined ? undefined : parsePointerSegment(segment);
};
