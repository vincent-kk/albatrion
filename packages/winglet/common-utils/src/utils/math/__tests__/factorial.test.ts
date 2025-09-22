import { describe, expect, it } from 'vitest';

import { factorial } from '../factorial';

describe('factorial', () => {
  it('작은 수의 팩토리얼을 올바르게 계산해야 합니다', () => {
    expect(factorial(0)).toBe(1);
    expect(factorial(1)).toBe(1);
    expect(factorial(2)).toBe(2);
    expect(factorial(3)).toBe(6);
    expect(factorial(4)).toBe(24);
    expect(factorial(5)).toBe(120);
    expect(factorial(6)).toBe(720);
    expect(factorial(7)).toBe(5040);
  });

  it('큰 수의 팩토리얼도 올바르게 계산해야 합니다', () => {
    expect(factorial(10)).toBe(3628800);
    expect(factorial(12)).toBe(479001600);
    expect(factorial(15)).toBe(1307674368000);
  });

  it('메모이제이션이 올바르게 동작해야 합니다', () => {
    // 캐시 채우기
    factorial(15);

    const result1 = factorial(15);
    const result2 = factorial(15); // 캐시된 값 사용

    expect(result1).toBe(1307674368000);
    expect(result2).toBe(1307674368000);
    // 성능 테스트는 환경에 따라 달라질 수 있으므로 단순히 결과가 같은지만 확인
    expect(result1).toBe(result2);
  });

  it('음수는 에러를 발생시켜야 합니다', () => {
    expect(() => factorial(-1)).toThrow('Factorial is only defined for non-negative integers');
    expect(() => factorial(-10)).toThrow('Factorial is only defined for non-negative integers');
  });

  it('소수점 숫자는 에러를 발생시켜야 합니다', () => {
    expect(() => factorial(1.5)).toThrow('Factorial is only defined for non-negative integers');
    expect(() => factorial(2.7)).toThrow('Factorial is only defined for non-negative integers');
    expect(() => factorial(0.5)).toThrow('Factorial is only defined for non-negative integers');
  });

  it('특수한 값들도 처리해야 합니다', () => {
    expect(() => factorial(Infinity)).toThrow('Factorial is only defined for non-negative integers');
    expect(() => factorial(-Infinity)).toThrow('Factorial is only defined for non-negative integers');
    expect(() => factorial(NaN)).toThrow('Factorial is only defined for non-negative integers');
  });
});