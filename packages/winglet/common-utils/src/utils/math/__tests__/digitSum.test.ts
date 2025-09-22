import { describe, expect, it } from 'vitest';

import { digitSum } from '../digitSum';

describe('digitSum', () => {
  it('자릿수의 합을 올바르게 계산해야 합니다', () => {
    expect(digitSum(123)).toBe(6); // 1 + 2 + 3 = 6
    expect(digitSum(456)).toBe(15); // 4 + 5 + 6 = 15
    expect(digitSum(789)).toBe(24); // 7 + 8 + 9 = 24
    expect(digitSum(1111)).toBe(4); // 1 + 1 + 1 + 1 = 4
  });

  it('한 자리 숫자를 올바르게 처리해야 합니다', () => {
    expect(digitSum(0)).toBe(0);
    expect(digitSum(5)).toBe(5);
    expect(digitSum(9)).toBe(9);
  });

  it('음수의 자릿수 합은 절대값의 자릿수 합과 같아야 합니다', () => {
    expect(digitSum(-123)).toBe(6);
    expect(digitSum(-456)).toBe(15);
    expect(digitSum(-789)).toBe(24);
  });

  it('큰 수도 올바르게 처리해야 합니다', () => {
    expect(digitSum(1234567890)).toBe(45); // 1부터 9까지의 합 = 45
    expect(digitSum(999999999)).toBe(81); // 9 * 9 = 81
    expect(digitSum(1000000000)).toBe(1); // 1 + 0*9 = 1
  });

  it('소수점 숫자는 에러를 발생시켜야 합니다', () => {
    expect(() => digitSum(1.5)).toThrow('digitSum is only defined for integers');
    expect(() => digitSum(2.7)).toThrow('digitSum is only defined for integers');
    expect(() => digitSum(0.1)).toThrow('digitSum is only defined for integers');
  });

  it('특수한 값들도 처리해야 합니다', () => {
    expect(() => digitSum(Infinity)).toThrow('digitSum is only defined for integers');
    expect(() => digitSum(-Infinity)).toThrow('digitSum is only defined for integers');
    expect(() => digitSum(NaN)).toThrow('digitSum is only defined for integers');
  });
});