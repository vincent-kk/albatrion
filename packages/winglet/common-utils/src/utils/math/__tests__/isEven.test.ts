import { describe, expect, it } from 'vitest';

import { isEven } from '../isEven';

describe('isEven', () => {
  it('짝수는 true를 반환해야 합니다', () => {
    expect(isEven(0)).toBe(true);
    expect(isEven(2)).toBe(true);
    expect(isEven(4)).toBe(true);
    expect(isEven(100)).toBe(true);
    expect(isEven(1000)).toBe(true);
  });

  it('홀수는 false를 반환해야 합니다', () => {
    expect(isEven(1)).toBe(false);
    expect(isEven(3)).toBe(false);
    expect(isEven(5)).toBe(false);
    expect(isEven(99)).toBe(false);
    expect(isEven(1001)).toBe(false);
  });

  it('음수도 올바르게 처리해야 합니다', () => {
    expect(isEven(-2)).toBe(true);
    expect(isEven(-4)).toBe(true);
    expect(isEven(-1)).toBe(false);
    expect(isEven(-3)).toBe(false);
  });

  it('소수점 숫자는 정수 부분으로 판단해야 합니다', () => {
    expect(isEven(2.1)).toBe(false);
    expect(isEven(2.9)).toBe(false);
    expect(isEven(3.1)).toBe(false);
    expect(isEven(4.1)).toBe(false);
  });

  it('특수한 값들도 처리해야 합니다', () => {
    expect(isEven(Infinity)).toBe(false);
    expect(isEven(-Infinity)).toBe(false);
    expect(isEven(NaN)).toBe(false);
  });
});
