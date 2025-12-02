import { describe, expect, it } from 'vitest';

import { inRange } from '../inRange';

describe('inRange', () => {
  it('범위 내의 값은 true를 반환해야 합니다', () => {
    expect(inRange(5, 0, 10)).toBe(true);
    expect(inRange(0, 0, 10)).toBe(true);
    expect(inRange(10, 0, 10)).toBe(true);
    expect(inRange(5.5, 0, 10)).toBe(true);
  });

  it('범위 밖의 값은 false를 반환해야 합니다', () => {
    expect(inRange(-1, 0, 10)).toBe(false);
    expect(inRange(11, 0, 10)).toBe(false);
    expect(inRange(-0.1, 0, 10)).toBe(false);
    expect(inRange(10.1, 0, 10)).toBe(false);
  });

  it('음수 범위도 올바르게 처리해야 합니다', () => {
    expect(inRange(-5, -10, 0)).toBe(true);
    expect(inRange(-10, -10, 0)).toBe(true);
    expect(inRange(0, -10, 0)).toBe(true);
    expect(inRange(-11, -10, 0)).toBe(false);
    expect(inRange(1, -10, 0)).toBe(false);
  });

  it('소수점 범위도 올바르게 처리해야 합니다', () => {
    expect(inRange(1.5, 1.0, 2.0)).toBe(true);
    expect(inRange(1.0, 1.0, 2.0)).toBe(true);
    expect(inRange(2.0, 1.0, 2.0)).toBe(true);
    expect(inRange(0.9, 1.0, 2.0)).toBe(false);
    expect(inRange(2.1, 1.0, 2.0)).toBe(false);
  });

  it('같은 min과 max 값일 때도 올바르게 처리해야 합니다', () => {
    expect(inRange(5, 5, 5)).toBe(true);
    expect(inRange(4, 5, 5)).toBe(false);
    expect(inRange(6, 5, 5)).toBe(false);
  });

  it('특수한 값들도 처리해야 합니다', () => {
    expect(inRange(50, -Infinity, Infinity)).toBe(true);
    expect(inRange(Infinity, 0, 100)).toBe(false);
    expect(inRange(-Infinity, 0, 100)).toBe(false);
    expect(inRange(NaN, 0, 100)).toBe(false);
    expect(inRange(50, NaN, 100)).toBe(false);
    expect(inRange(50, 0, NaN)).toBe(false);
  });
});
