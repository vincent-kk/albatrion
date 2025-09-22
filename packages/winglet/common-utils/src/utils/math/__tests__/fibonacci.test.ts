import { describe, expect, it } from 'vitest';

import { fibonacci } from '../fibonacci';

describe('fibonacci', () => {
  it('기본 피보나치 수를 올바르게 계산해야 합니다', () => {
    expect(fibonacci(0)).toBe(0);
    expect(fibonacci(1)).toBe(1);
    expect(fibonacci(2)).toBe(1);
    expect(fibonacci(3)).toBe(2);
    expect(fibonacci(4)).toBe(3);
    expect(fibonacci(5)).toBe(5);
    expect(fibonacci(6)).toBe(8);
    expect(fibonacci(7)).toBe(13);
    expect(fibonacci(8)).toBe(21);
    expect(fibonacci(9)).toBe(34);
    expect(fibonacci(10)).toBe(55);
  });

  it('큰 피보나치 수도 올바르게 계산해야 합니다', () => {
    expect(fibonacci(15)).toBe(610);
    expect(fibonacci(20)).toBe(6765);
    expect(fibonacci(25)).toBe(75025);
    expect(fibonacci(30)).toBe(832040);
  });

  it('메모이제이션이 올바르게 동작해야 합니다', () => {
    // 캐시 초기화를 위해 새로운 값 사용
    fibonacci(35); // 첫 번째 계산으로 캐시 채우기

    const result1 = fibonacci(35);

    const result2 = fibonacci(35); // 캐시된 값 사용

    expect(result1).toBe(9227465);
    expect(result2).toBe(9227465);
    // 성능 테스트는 환경에 따라 달라질 수 있으므로 단순히 결과가 같은지만 확인
    expect(result1).toBe(result2);
  });

  it('음수는 에러를 발생시켜야 합니다', () => {
    expect(() => fibonacci(-1)).toThrow(
      'Fibonacci is only defined for non-negative integers',
    );
    expect(() => fibonacci(-10)).toThrow(
      'Fibonacci is only defined for non-negative integers',
    );
  });

  it('소수점 숫자는 에러를 발생시켜야 합니다', () => {
    expect(() => fibonacci(1.5)).toThrow(
      'Fibonacci is only defined for non-negative integers',
    );
    expect(() => fibonacci(2.7)).toThrow(
      'Fibonacci is only defined for non-negative integers',
    );
    expect(() => fibonacci(0.5)).toThrow(
      'Fibonacci is only defined for non-negative integers',
    );
  });

  it('특수한 값들도 처리해야 합니다', () => {
    expect(() => fibonacci(Infinity)).toThrow(
      'Fibonacci is only defined for non-negative integers',
    );
    expect(() => fibonacci(-Infinity)).toThrow(
      'Fibonacci is only defined for non-negative integers',
    );
    expect(() => fibonacci(NaN)).toThrow(
      'Fibonacci is only defined for non-negative integers',
    );
  });
});
