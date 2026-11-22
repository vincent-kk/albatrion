import { describe, expect, it, vi } from 'vitest';

import {
  JSON_POINTER_PATH_REGEX,
  JSON_POINTER_PATH_STICKY_REGEX,
} from '../regex';
import { replaceExpressionPaths } from '../replaceExpressionPaths';

/**
 * Expressions without a quote, a comment or a regular expression literal, sampled from the
 * regex corpus in this directory plus the absolute-path and division shapes the scanner must
 * keep as paths.
 */
const CODE_ONLY_EXPRESSIONS = [
  '/property',
  '../a / /b',
  '/absolutePath',
  '/path/@/other',
  '(/key%percent)',
  '(#/사용자/이름)',
  '/繁體中文',
  '(/$)',
  '/return',
  '(/~1.0.0)',
  '/key*asterisk',
  '/api/v2',
  '/회원/주소/상세주소',
  '(/).property',
  '(/path)',
  '#/사용자/이름 && ../나이 >= 20 && ./주소/지역',
  '../isVIP ? ../../vipPrice : ../regularPrice',
  '!../type',
  '(../a)%(../b)',
  '../api+version',
  '../path && @',
  'x&&@',
  '../@/data',
  '../kebab-case-key',
  '../😀happy',
  '(#/if)',
  '#/v1.2.3',
  '../$jquery',
  '../email@address',
  '#/definitions/user',
  '/price * /quantity * (1 - /discount / 100)',
  '/user/id === 1',
  '/a/g',
  '/a/ 2',
  '../items/* === 1',
  '(../price) / 100',
  '../val/2',
  '../val / 2',
];

const mark = (path: string) => `<${path}>`;

describe('replaceExpressionPaths on code-only expressions', () => {
  it('matches the plain path regex replacement through the scanner', () => {
    for (const expression of CODE_ONLY_EXPRESSIONS) {
      const expected = expression.replace(JSON_POINTER_PATH_REGEX, mark);
      expect(replaceExpressionPaths(expression, mark)).toBe(expected);
    }
  });

  it('reuses the path match when a slash token could open a regexp', () => {
    const matchPath = vi.spyOn(JSON_POINTER_PATH_STICKY_REGEX, 'exec');
    try {
      expect(replaceExpressionPaths('/a/g', mark)).toBe('</a/g>');
      expect(matchPath).toHaveBeenCalledTimes(1);
    } finally {
      matchPath.mockRestore();
    }
  });
});
