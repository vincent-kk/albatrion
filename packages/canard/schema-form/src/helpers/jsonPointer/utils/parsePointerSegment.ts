import { unescapeSegment } from '@winglet/json/pointer-escape';

import { JSONPointer as $ } from '../constants/JSONPointer';
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
    case $.Wildcard:
      return PointerOperator.Wildcard;
    case $.Parent:
      return PointerOperator.Parent;
    case $.Current:
      return PointerOperator.Current;
    case $.Context:
      return PointerOperator.Context;
    case '%2A':
      return $.Wildcard;
    case '%2E%2E':
      return $.Parent;
    case '%2E':
      return $.Current;
    case '%40':
      return $.Context;
    default:
      return token.includes('~') ? unescapeSegment(token) : token;
  }
};
