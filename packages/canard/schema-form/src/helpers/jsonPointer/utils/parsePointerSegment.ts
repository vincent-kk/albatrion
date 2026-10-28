import { unescapeSegment } from '@winglet/json/pointer-escape';

import {
  PointerOperator,
  type PointerSegment,
} from '../constants/PointerOperator';

/**
 * Apply the three segment rules to one already split token.
 * @param token - One raw segment between slashes; the empty string and `#` are ordinary names here.
 * @returns A PointerOperator for exactly `*`, `..`, `.` or `@`; the literal name for exactly `%2A`, `%2E%2E`, `%2E` or `%40`; otherwise the token with `~1` and `~0` decoded. A token without `~` is returned unchanged.
 */
export const parsePointerSegment = (token: string): PointerSegment => {
  switch (token) {
    case '*':
      return PointerOperator.Wildcard;
    case '..':
      return PointerOperator.Parent;
    case '.':
      return PointerOperator.Current;
    case '@':
      return PointerOperator.Context;
    case '%2A':
      return '*';
    case '%2E%2E':
      return '..';
    case '%2E':
      return '.';
    case '%40':
      return '@';
    default:
      return token.includes('~') ? unescapeSegment(token) : token;
  }
};
