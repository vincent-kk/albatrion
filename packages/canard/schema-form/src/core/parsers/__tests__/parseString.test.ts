import { describe, expect, it } from 'vitest';

import { parseString } from '../parseString';

describe('parseString', () => {
  it('문자열을 입력하면 공백이 제거된 문자열을 반환해야 합니다', () => {
    expect(parseString('  hello  ')).toBe('  hello  ');
  });

  it('빈 문자열을 입력하면 undefined를 반환해야 합니다', () => {
    expect(parseString('')).toBeUndefined();
  });
  it('숫자를 입력하면 문자열로 변환되어야 합니다', () => {
    expect(parseString(123)).toBe('123');
    expect(parseString(3.14)).toBe('3.14');
  });

  it('문자열이나 숫자가 아닌 값을 입력하면 undefined를 반환해야 합니다', () => {
    expect(parseString(null)).toBeUndefined();
    expect(parseString(undefined)).toBeUndefined();
    expect(parseString({})).toBeUndefined();
    expect(parseString([])).toBeUndefined();
  });
});
