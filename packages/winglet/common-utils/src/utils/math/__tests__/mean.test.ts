import { describe, expect, it } from 'vitest';

import { mean } from '../mean';

describe('mean', () => {
  it('평균을 올바르게 계산해야 합니다', () => {
    expect(mean([1, 2, 3, 4, 5])).toBe(3);
    expect(mean([10, 20, 30])).toBe(20);
    expect(mean([0, 0, 0])).toBe(0);
    expect(mean([100])).toBe(100);
  });

  it('음수가 포함된 배열의 평균을 계산해야 합니다', () => {
    expect(mean([-5, -3, -1])).toBe(-3);
    expect(mean([-10, 0, 10])).toBe(0);
    expect(mean([-5, 5, -10, 10])).toBe(0);
  });

  it('소수점 숫자들의 평균을 올바르게 계산해야 합니다', () => {
    expect(mean([1.5, 2.5, 3.5])).toBe(2.5);
    expect(mean([0.1, 0.2, 0.3])).toBeCloseTo(0.2);
    expect(mean([1.1, 1.2, 1.3, 1.4])).toBeCloseTo(1.25);
  });

  it('빈 배열은 NaN을 반환해야 합니다', () => {
    expect(mean([])).toBeNaN();
  });

  it('큰 배열의 평균도 올바르게 계산해야 합니다', () => {
    const largeArray = Array.from({ length: 100 }, (_, i) => i + 1);
    expect(mean(largeArray)).toBe(50.5); // 1부터 100까지의 평균
  });

  it('특수한 값들도 처리해야 합니다', () => {
    expect(mean([Infinity, 1])).toBe(Infinity);
    expect(mean([-Infinity, 1])).toBe(-Infinity);
    expect(mean([Infinity, -Infinity])).toBeNaN();
    expect(mean([NaN, 1, 2])).toBeNaN();
  });
});