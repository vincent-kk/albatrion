import { describe, expect, it } from 'vitest';

import { combination } from '../combination';

describe('combination', () => {
  it('기본 조합을 올바르게 계산해야 합니다', () => {
    expect(combination(5, 2)).toBe(10); // C(5,2) = 10
    expect(combination(5, 3)).toBe(10); // C(5,3) = 10
    expect(combination(6, 2)).toBe(15); // C(6,2) = 15
    expect(combination(6, 4)).toBe(15); // C(6,4) = 15
    expect(combination(10, 5)).toBe(252); // C(10,5) = 252
  });

  it('경계 조건을 올바르게 처리해야 합니다', () => {
    expect(combination(5, 0)).toBe(1); // C(n,0) = 1
    expect(combination(5, 5)).toBe(1); // C(n,n) = 1
    expect(combination(5, 1)).toBe(5); // C(n,1) = n
    expect(combination(5, 4)).toBe(5); // C(n,n-1) = n
  });

  it('r이 n보다 큰 경우 0을 반환해야 합니다', () => {
    expect(combination(5, 6)).toBe(0);
    expect(combination(3, 10)).toBe(0);
    expect(combination(0, 1)).toBe(0);
  });

  it('큰 수의 조합도 올바르게 계산해야 합니다', () => {
    expect(combination(20, 10)).toBe(184756);
    expect(combination(15, 7)).toBe(6435);
    expect(combination(12, 6)).toBe(924);
  });

  it('대칭성을 활용한 최적화가 동작해야 합니다', () => {
    expect(combination(10, 3)).toBe(combination(10, 7)); // C(n,r) = C(n,n-r)
    expect(combination(15, 5)).toBe(combination(15, 10));
    expect(combination(20, 8)).toBe(combination(20, 12));
  });

  it('음수는 에러를 발생시켜야 합니다', () => {
    expect(() => combination(-5, 2)).toThrow(
      'Combination is only defined for non-negative integers',
    );
    expect(() => combination(5, -2)).toThrow(
      'Combination is only defined for non-negative integers',
    );
    expect(() => combination(-5, -2)).toThrow(
      'Combination is only defined for non-negative integers',
    );
  });

  it('소수점 숫자는 에러를 발생시켜야 합니다', () => {
    expect(() => combination(5.5, 2)).toThrow(
      'Combination is only defined for non-negative integers',
    );
    expect(() => combination(5, 2.5)).toThrow(
      'Combination is only defined for non-negative integers',
    );
    expect(() => combination(5.5, 2.5)).toThrow(
      'Combination is only defined for non-negative integers',
    );
  });

  it('특수한 값들도 처리해야 합니다', () => {
    expect(() => combination(Infinity, 5)).toThrow(
      'Combination is only defined for non-negative integers',
    );
    expect(() => combination(5, Infinity)).toThrow(
      'Combination is only defined for non-negative integers',
    );
    expect(() => combination(NaN, 5)).toThrow(
      'Combination is only defined for non-negative integers',
    );
  });
});
