import { describe, expect, it } from 'vitest';

import { max } from '../max';

describe('max', () => {
  it('배열에서 최대값을 찾아야 합니다', () => {
    expect(max([1, 2, 3, 4, 5])).toBe(5);
    expect(max([5, 4, 3, 2, 1])).toBe(5);
    expect(max([3, 1, 4, 1, 5, 9])).toBe(9);
  });

  it('음수가 포함된 배열도 올바르게 처리해야 합니다', () => {
    expect(max([-5, -1, 0, 1, 5])).toBe(5);
    expect(max([10, -20, 30])).toBe(30);
    expect(max([-100, -200, -50])).toBe(-50);
  });

  it('소수점 숫자들도 올바르게 처리해야 합니다', () => {
    expect(max([1.5, 2.7, 0.3, 5.9])).toBe(5.9);
    expect(max([0.1, 0.01, 0.001])).toBe(0.1);
  });

  it('한 개의 요소만 있는 배열은 그 요소를 반환해야 합니다', () => {
    expect(max([42])).toBe(42);
    expect(max([-42])).toBe(-42);
    expect(max([0])).toBe(0);
  });

  it('빈 배열은 -Infinity를 반환해야 합니다', () => {
    expect(max([])).toBe(-Infinity);
  });

  it('특수한 값들도 처리해야 합니다', () => {
    expect(max([-Infinity, 1, 2])).toBe(2);
    expect(max([1, 2, Infinity])).toBe(Infinity);
    expect(max([NaN, 1, 2])).toBeNaN();
    expect(max([1, NaN, 2])).toBe(2); // NaN은 비교에서 false가 되므로 다른 값이 선택됨
  });

  it('큰 배열도 효율적으로 처리해야 합니다', () => {
    const largeArray = Array.from({ length: 10000 }, (_, i) => i);
    expect(max(largeArray)).toBe(9999);

    const randomArray = Array.from(
      { length: 10000 },
      () => Math.random() * 1000,
    );
    randomArray.push(10001);
    expect(max(randomArray)).toBe(10001);
  });
});
