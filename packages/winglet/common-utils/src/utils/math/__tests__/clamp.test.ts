import { describe, expect, it } from 'vitest';

import { clamp } from '../clamp';

describe('clamp', () => {
  it('범위 내의 값은 그대로 반환해야 합니다', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(0, -10, 10)).toBe(0);
    expect(clamp(-5, -10, 0)).toBe(-5);
  });

  it('최소값보다 작은 값은 최소값을 반환해야 합니다', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(-100, -10, 10)).toBe(-10);
    expect(clamp(0, 5, 10)).toBe(5);
  });

  it('최대값보다 큰 값은 최대값을 반환해야 합니다', () => {
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(100, -10, 10)).toBe(10);
    expect(clamp(0, -10, -5)).toBe(-5);
  });

  it('경계값을 올바르게 처리해야 합니다', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
    expect(clamp(-10, -10, 10)).toBe(-10);
  });

  it('소수점 숫자들도 올바르게 처리해야 합니다', () => {
    expect(clamp(1.5, 0.5, 2.5)).toBe(1.5);
    expect(clamp(0.3, 0.5, 2.5)).toBe(0.5);
    expect(clamp(3.0, 0.5, 2.5)).toBe(2.5);
  });

  it('min과 max가 같을 때는 그 값을 반환해야 합니다', () => {
    expect(clamp(5, 10, 10)).toBe(10);
    expect(clamp(15, 10, 10)).toBe(10);
    expect(clamp(10, 10, 10)).toBe(10);
  });

  it('특수한 값들도 처리해야 합니다', () => {
    expect(clamp(Infinity, 0, 100)).toBe(100);
    expect(clamp(-Infinity, 0, 100)).toBe(0);
    expect(clamp(50, -Infinity, Infinity)).toBe(50);
    expect(clamp(NaN, 0, 100)).toBeNaN();
  });
});