import {
  PointerOperator,
  type PointerSegment,
} from '../constants/PointerOperator';
import { formatSegment } from './formatSegment';

/** Build an absolute form pointer from decoded names and parsed operators. */
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
