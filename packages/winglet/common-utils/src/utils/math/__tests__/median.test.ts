import { describe, expect, it } from 'vitest';

import { median } from '../median';

describe('median', () => {
  it('홀수 개의 요소를 가진 배열의 중앙값을 찾아야 합니다', () => {
    expect(median([1, 2, 3])).toBe(2);
    expect(median([1, 3, 2])).toBe(2); // 정렬 후
    expect(median([1, 2, 3, 4, 5])).toBe(3);
    expect(median([5, 1, 3, 2, 4])).toBe(3); // 정렬 후
  });

  it('짝수 개의 요소를 가진 배열의 중앙값을 찾아야 합니다', () => {
    expect(median([1, 2])).toBe(1.5);
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([4, 2, 3, 1])).toBe(2.5); // 정렬 후
    expect(median([10, 20, 30, 40])).toBe(25);
  });

  it('한 개의 요소만 있는 배열은 그 요소를 반환해야 합니다', () => {
    expect(median([5])).toBe(5);
    expect(median([-5])).toBe(-5);
    expect(median([0])).toBe(0);
  });

  it('음수가 포함된 배열도 올바르게 처리해야 합니다', () => {
    expect(median([-5, -3, -1, 1, 3])).toBe(-1);
    expect(median([-10, -5, 0, 5])).toBe(-2.5);
    expect(median([-100, -50, -25])).toBe(-50);
  });

  it('소수점 숫자들도 올바르게 처리해야 합니다', () => {
    expect(median([1.1, 2.2, 3.3])).toBe(2.2);
    expect(median([1.5, 2.5, 3.5, 4.5])).toBe(3);
    expect(median([0.1, 0.2, 0.3, 0.4, 0.5])).toBe(0.3);
  });

  it('빈 배열은 NaN을 반환해야 합니다', () => {
    expect(median([])).toBeNaN();
  });

  it('같은 값들이 반복되는 배열도 올바르게 처리해야 합니다', () => {
    expect(median([1, 1, 1, 1])).toBe(1);
    expect(median([5, 5, 5])).toBe(5);
    expect(median([1, 2, 2, 3])).toBe(2);
  });

  it('특수한 값들도 처리해야 합니다', () => {
    expect(median([1, 2, Infinity])).toBe(2);
    expect(median([-Infinity, 0, Infinity])).toBe(0);
    expect(median([NaN, 1, 2])).toBe(1); // NaN은 정렬에서 첫 번째로 오므로 중앙값은 1
  });
});
