import {
  PointerOperator,
  type PointerSegment,
} from '../constants/PointerOperator';
import { formatSegment } from './formatSegment';

/**
 * Assemble an absolute address from decoded names and parsed operators.
 * @param segments - Decoded names (any string, including the empty name) and PointerOperator symbols, outermost first.
 * @returns The empty string for no segments, otherwise a `/`-prefixed address with each name formatted by formatSegment and each operator written as its raw token.
 */
export const joinPointer = (segments: readonly PointerSegment[]): string => {
  let path = '';
  for (const segment of segments) {
    const token =
      typeof segment === 'string'
        ? formatSegment(segment)
        : segment === PointerOperator.Wildcard
          ? '*'
          : segment === PointerOperator.Parent
            ? '..'
            : segment === PointerOperator.Current
              ? '.'
              : '@';
    path += '/' + token;
  }
  return path;
};
