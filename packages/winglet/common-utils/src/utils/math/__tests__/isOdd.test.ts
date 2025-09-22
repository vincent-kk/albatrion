import { describe, expect, it } from 'vitest';

import { isOdd } from '../isOdd';

describe('isOdd', () => {
  it('홀수는 true를 반환해야 합니다', () => {
    expect(isOdd(1)).toBe(true);
    expect(isOdd(3)).toBe(true);
    expect(isOdd(5)).toBe(true);
    expect(isOdd(99)).toBe(true);
    expect(isOdd(1001)).toBe(true);
  });

  it('짝수는 false를 반환해야 합니다', () => {
    expect(isOdd(0)).toBe(false);
    expect(isOdd(2)).toBe(false);
    expect(isOdd(4)).toBe(false);
    expect(isOdd(100)).toBe(false);
    expect(isOdd(1000)).toBe(false);
  });

  it('음수도 올바르게 처리해야 합니다', () => {
    expect(isOdd(-1)).toBe(true);
    expect(isOdd(-3)).toBe(true);
    expect(isOdd(-2)).toBe(false);
    expect(isOdd(-4)).toBe(false);
  });

  it('소수점 숫자는 나머지 연산 결과로 판단해야 합니다', () => {
    expect(isOdd(1.1)).toBe(false);
    expect(isOdd(1.9)).toBe(false);
    expect(isOdd(3.1)).toBe(false);
    expect(isOdd(2.1)).toBe(false); // 2.1 % 2 !== 0 이므로 홀수로 판단
  });

  it('특수한 값들도 처리해야 합니다', () => {
    expect(isOdd(Infinity)).toBe(false);
    expect(isOdd(-Infinity)).toBe(false);
    expect(isOdd(NaN)).toBe(false);
  });
});
