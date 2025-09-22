import { describe, expect, it } from 'vitest';

import { range } from '../range';

describe('range', () => {
  it('범위(최대값-최소값)를 올바르게 계산해야 합니다', () => {
    expect(range([1, 2, 3, 4, 5])).toBe(4);
    expect(range([10, 20, 30])).toBe(20);
    expect(range([5, 5, 5])).toBe(0);
    expect(range([100])).toBe(0);
  });

  it('음수가 포함된 배열의 범위를 계산해야 합니다', () => {
    expect(range([-5, -3, -1])).toBe(4);
    expect(range([-10, 0, 10])).toBe(20);
    expect(range([-5, 5])).toBe(10);
  });

  it('소수점 숫자들의 범위를 올바르게 계산해야 합니다', () => {
    expect(range([1.5, 2.5, 3.5])).toBe(2);
    expect(range([0.1, 0.5, 0.9])).toBeCloseTo(0.8);
    expect(range([1.1, 1.2, 1.3, 1.4])).toBeCloseTo(0.3);
  });

  it('정렬되지 않은 배열도 올바르게 처리해야 합니다', () => {
    expect(range([5, 1, 3, 2, 4])).toBe(4);
    expect(range([100, 0, 50])).toBe(100);
    expect(range([-50, 100, 0, -100, 50])).toBe(200);
  });

  it('한 개의 요소만 있는 배열은 0을 반환해야 합니다', () => {
    expect(range([5])).toBe(0);
    expect(range([-5])).toBe(0);
    expect(range([0])).toBe(0);
  });

  it('빈 배열은 NaN을 반환해야 합니다', () => {
    expect(range([])).toBeNaN();
  });

  it('큰 배열의 범위도 올바르게 계산해야 합니다', () => {
    const largeArray = Array.from({ length: 1000 }, (_, i) => i);
    expect(range(largeArray)).toBe(999);
  });

  it('특수한 값들도 처리해야 합니다', () => {
    expect(range([Infinity, 1])).toBe(Infinity);
    expect(range([-Infinity, 1])).toBe(Infinity);
    expect(range([-Infinity, Infinity])).toBe(Infinity);
    expect(range([NaN, 1, 2])).toBeNaN();
  });
});