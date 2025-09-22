import { describe, expect, it } from 'vitest';

import { min } from '../min';

describe('min', () => {
  it('배열에서 최소값을 찾아야 합니다', () => {
    expect(min([1, 2, 3, 4, 5])).toBe(1);
    expect(min([5, 4, 3, 2, 1])).toBe(1);
    expect(min([3, 1, 4, 1, 5, 9])).toBe(1);
  });

  it('음수가 포함된 배열도 올바르게 처리해야 합니다', () => {
    expect(min([-5, -1, 0, 1, 5])).toBe(-5);
    expect(min([10, -20, 30])).toBe(-20);
    expect(min([-100, -200, -50])).toBe(-200);
  });

  it('소수점 숫자들도 올바르게 처리해야 합니다', () => {
    expect(min([1.5, 2.7, 0.3, 5.9])).toBe(0.3);
    expect(min([0.1, 0.01, 0.001])).toBe(0.001);
  });

  it('한 개의 요소만 있는 배열은 그 요소를 반환해야 합니다', () => {
    expect(min([42])).toBe(42);
    expect(min([-42])).toBe(-42);
    expect(min([0])).toBe(0);
  });

  it('빈 배열은 Infinity를 반환해야 합니다', () => {
    expect(min([])).toBe(Infinity);
  });

  it('특수한 값들도 처리해야 합니다', () => {
    expect(min([Infinity, 1, 2])).toBe(1);
    expect(min([1, 2, -Infinity])).toBe(-Infinity);
    expect(min([NaN, 1, 2])).toBeNaN();
    expect(min([1, NaN, 2])).toBe(1); // NaN은 비교에서 false가 되므로 다른 값이 선택됨
  });

  it('큰 배열도 효율적으로 처리해야 합니다', () => {
    const largeArray = Array.from({ length: 10000 }, (_, i) => i);
    expect(min(largeArray)).toBe(0);

    const randomArray = Array.from({ length: 10000 }, () => Math.random() * 1000);
    randomArray.push(-1);
    expect(min(randomArray)).toBe(-1);
  });
});