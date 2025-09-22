import { describe, expect, it } from 'vitest';

import { permutation } from '../permutation';

describe('permutation', () => {
  it('기본 순열을 올바르게 계산해야 합니다', () => {
    expect(permutation(5, 2)).toBe(20); // P(5,2) = 5*4 = 20
    expect(permutation(5, 3)).toBe(60); // P(5,3) = 5*4*3 = 60
    expect(permutation(6, 2)).toBe(30); // P(6,2) = 6*5 = 30
    expect(permutation(6, 4)).toBe(360); // P(6,4) = 6*5*4*3 = 360
    expect(permutation(10, 3)).toBe(720); // P(10,3) = 10*9*8 = 720
  });

  it('경계 조건을 올바르게 처리해야 합니다', () => {
    expect(permutation(5, 0)).toBe(1); // P(n,0) = 1
    expect(permutation(5, 1)).toBe(5); // P(n,1) = n
    expect(permutation(5, 5)).toBe(120); // P(n,n) = n!
    expect(permutation(6, 6)).toBe(720); // P(6,6) = 6!
  });

  it('r이 n보다 큰 경우 0을 반환해야 합니다', () => {
    expect(permutation(5, 6)).toBe(0);
    expect(permutation(3, 10)).toBe(0);
    expect(permutation(0, 1)).toBe(0);
  });

  it('큰 수의 순열도 올바르게 계산해야 합니다', () => {
    expect(permutation(10, 5)).toBe(30240); // P(10,5) = 10*9*8*7*6
    expect(permutation(12, 4)).toBe(11880); // P(12,4) = 12*11*10*9
    expect(permutation(15, 3)).toBe(2730); // P(15,3) = 15*14*13
  });

  it('음수는 에러를 발생시켜야 합니다', () => {
    expect(() => permutation(-5, 2)).toThrow('Permutation is only defined for non-negative integers');
    expect(() => permutation(5, -2)).toThrow('Permutation is only defined for non-negative integers');
    expect(() => permutation(-5, -2)).toThrow('Permutation is only defined for non-negative integers');
  });

  it('소수점 숫자는 에러를 발생시켜야 합니다', () => {
    expect(() => permutation(5.5, 2)).toThrow('Permutation is only defined for non-negative integers');
    expect(() => permutation(5, 2.5)).toThrow('Permutation is only defined for non-negative integers');
    expect(() => permutation(5.5, 2.5)).toThrow('Permutation is only defined for non-negative integers');
  });

  it('특수한 값들도 처리해야 합니다', () => {
    expect(() => permutation(Infinity, 5)).toThrow('Permutation is only defined for non-negative integers');
    expect(() => permutation(5, Infinity)).toThrow('Permutation is only defined for non-negative integers');
    expect(() => permutation(NaN, 5)).toThrow('Permutation is only defined for non-negative integers');
  });
});