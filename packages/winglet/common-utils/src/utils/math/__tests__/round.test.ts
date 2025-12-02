import { describe, expect, it } from 'vitest';

import { round } from '../round';

describe('round', () => {
  it('정밀도가 없으면 정수로 반올림해야 합니다', () => {
    expect(round(4.6)).toBe(5);
    expect(round(4.5)).toBe(5);
    expect(round(4.4)).toBe(4);
    expect(round(-4.6)).toBe(-5);
    expect(round(-4.5)).toBe(-4);
    expect(round(-4.4)).toBe(-4);
  });

  it('지정된 정밀도로 반올림해야 합니다', () => {
    expect(round(4.567, 1)).toBe(4.6);
    expect(round(4.567, 2)).toBe(4.57);
    expect(round(4.567, 3)).toBe(4.567);
    expect(round(4.5678, 3)).toBe(4.568);
  });

  it('음수 정밀도는 10의 배수로 반올림해야 합니다', () => {
    expect(round(1234.5, -1)).toBe(1230);
    expect(round(1234.5, -2)).toBe(1200);
    expect(round(1234.5, -3)).toBe(1000);
    expect(round(1500, -3)).toBe(2000);
  });

  it('0은 0을 반환해야 합니다', () => {
    expect(round(0, 0)).toBe(0);
    expect(round(0, 2)).toBe(0);
    expect(round(0, -2)).toBe(0);
  });

  it('매우 작은 숫자들도 올바르게 처리해야 합니다', () => {
    expect(round(0.0001234, 3)).toBe(0);
    expect(round(0.0001234, 4)).toBe(0.0001);
    expect(round(0.0001234, 5)).toBe(0.00012);
    expect(round(0.0001234, 6)).toBe(0.000123);
  });

  it('큰 정밀도 값도 처리해야 합니다', () => {
    expect(round(Math.PI, 10)).toBe(3.1415926536);
    expect(round(Math.E, 10)).toBe(2.7182818285);
  });

  it('특수한 값들도 처리해야 합니다', () => {
    expect(round(Infinity, 2)).toBe(Infinity);
    expect(round(-Infinity, 2)).toBe(-Infinity);
    expect(round(NaN, 2)).toBeNaN();
  });
});
