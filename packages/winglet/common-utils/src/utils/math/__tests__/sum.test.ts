import { describe, expect, it } from 'vitest';

import { sum } from '../sum';

describe('sum', () => {
  it('배열의 모든 요소를 합산해야 합니다', () => {
    expect(sum([1, 2, 3, 4, 5])).toBe(15);
    expect(sum([10, 20, 30])).toBe(60);
    expect(sum([0.1, 0.2, 0.3])).toBeCloseTo(0.6);
  });

  it('음수가 포함된 배열도 올바르게 처리해야 합니다', () => {
    expect(sum([-1, -2, -3])).toBe(-6);
    expect(sum([1, -1, 2, -2])).toBe(0);
    expect(sum([-5, 10, -3, 8])).toBe(10);
  });

  it('빈 배열은 0을 반환해야 합니다', () => {
    expect(sum([])).toBe(0);
  });

  it('한 개의 요소만 있는 배열은 그 요소를 반환해야 합니다', () => {
    expect(sum([5])).toBe(5);
    expect(sum([-5])).toBe(-5);
    expect(sum([0])).toBe(0);
  });

  it('큰 배열도 올바르게 처리해야 합니다', () => {
    const largeArray = Array.from({ length: 1000 }, (_, i) => i + 1);
    expect(sum(largeArray)).toBe(500500); // 1부터 1000까지의 합
  });

  it('소수점 정밀도 문제를 고려해야 합니다', () => {
    expect(sum([0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1])).toBeCloseTo(
      1,
    );
  });

  it('특수한 값들도 처리해야 합니다', () => {
    expect(sum([Infinity, 1])).toBe(Infinity);
    expect(sum([-Infinity, 1])).toBe(-Infinity);
    expect(sum([Infinity, -Infinity])).toBeNaN();
    expect(sum([NaN, 1])).toBeNaN();
  });
});
