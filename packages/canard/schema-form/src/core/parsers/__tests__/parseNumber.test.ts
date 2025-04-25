import { describe, expect, it } from 'vitest';

import { parseNumber } from '../parseNumber';

describe('parseNumber', () => {
  describe('정수 변환 (isInteger: true)', () => {
    it('숫자를 입력하면 정수로 변환되어야 합니다', () => {
      expect(parseNumber(3.14, true)).toBe(3);
      expect(parseNumber(-3.14, true)).toBe(-3);
    });

    it('문자열 숫자를 입력하면 정수로 변환되어야 합니다', () => {
      expect(parseNumber('3.14', true)).toBe(3);
      expect(parseNumber('-3.14', true)).toBe(-3);
    });

    it('숫자가 아닌 문자열을 입력하면 undefined를 반환해야 합니다', () => {
      expect(parseNumber('abc', true)).toBeUndefined();
    });

    it('NaN을 입력하면 undefined를 반환해야 합니다', () => {
      expect(parseNumber(NaN, true)).toBeUndefined();
    });
  });

  describe('실수 변환 (isInteger: false)', () => {
    it('숫자를 입력하면 그대로 반환해야 합니다', () => {
      expect(parseNumber(3.14, false)).toBe(3.14);
      expect(parseNumber(-3.14, false)).toBe(-3.14);
    });

    it('문자열 숫자를 입력하면 실수로 변환되어야 합니다', () => {
      expect(parseNumber('3.14', false)).toBe(3.14);
      expect(parseNumber('-3.14', false)).toBe(-3.14);
    });

    it('숫자가 아닌 문자열을 입력하면 undefined를 반환해야 합니다', () => {
      expect(parseNumber('abc', false)).toBeUndefined();
    });

    it('NaN을 입력하면 undefined를 반환해야 합니다', () => {
      expect(parseNumber(NaN, false)).toBeUndefined();
    });
  });
});
