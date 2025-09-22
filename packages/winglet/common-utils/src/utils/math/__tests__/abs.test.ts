import { describe, expect, it } from 'vitest';

import { abs } from '../abs';

describe('abs', () => {
  it('양수는 그대로 반환해야 합니다', () => {
    expect(abs(5)).toBe(5);
    expect(abs(10.5)).toBe(10.5);
    expect(abs(Number.MAX_VALUE)).toBe(Number.MAX_VALUE);
  });

  it('음수는 양수로 변환해야 합니다', () => {
    expect(abs(-5)).toBe(5);
    expect(abs(-10.5)).toBe(10.5);
    expect(abs(-Number.MAX_VALUE)).toBe(Number.MAX_VALUE);
  });

  it('0은 0을 반환해야 합니다', () => {
    expect(abs(0)).toBe(0);
    expect(abs(-0)).toBe(0);
  });

  it('특수한 값을 올바르게 처리해야 합니다', () => {
    expect(abs(Infinity)).toBe(Infinity);
    expect(abs(-Infinity)).toBe(Infinity);
    expect(Number.isNaN(abs(NaN))).toBe(true);
  });
});