import { unescapeSegment } from '@winglet/json/pointer-escape';

import {
  PointerOperator,
  type PointerSegment,
} from '../constants/PointerOperator';

/** Apply the ordered segment rules without changing ordinary percent names. */
export const parseSegment = (token: string): PointerSegment => {
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
