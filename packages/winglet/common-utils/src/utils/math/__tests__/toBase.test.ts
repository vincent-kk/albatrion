import { describe, expect, it } from 'vitest';

import { toBase } from '../toBase';

describe('toBase', () => {
  it('2진법 변환이 올바르게 동작해야 합니다', () => {
    expect(toBase(0, 2)).toBe('0');
    expect(toBase(1, 2)).toBe('1');
    expect(toBase(5, 2)).toBe('101');
    expect(toBase(10, 2)).toBe('1010');
    expect(toBase(255, 2)).toBe('11111111');
  });

  it('8진법 변환이 올바르게 동작해야 합니다', () => {
    expect(toBase(8, 8)).toBe('10');
    expect(toBase(64, 8)).toBe('100');
    expect(toBase(255, 8)).toBe('377');
  });

  it('16진법 변환이 올바르게 동작해야 합니다', () => {
    expect(toBase(10, 16)).toBe('A');
    expect(toBase(15, 16)).toBe('F');
    expect(toBase(255, 16)).toBe('FF');
    expect(toBase(4095, 16)).toBe('FFF');
  });

  it('임의의 진법 변환이 올바르게 동작해야 합니다', () => {
    expect(toBase(100, 5)).toBe('400');
    expect(toBase(100, 7)).toBe('202');
    expect(toBase(100, 36)).toBe('2S');
  });

  it('음수 변환이 올바르게 동작해야 합니다', () => {
    expect(toBase(-10, 2)).toBe('-1010');
    expect(toBase(-255, 16)).toBe('-FF');
    expect(toBase(-100, 10)).toBe('-100');
  });

  it('잘못된 진법은 에러를 발생시켜야 합니다', () => {
    expect(() => toBase(10, 1)).toThrow('Base must be an integer between 2 and 36');
    expect(() => toBase(10, 37)).toThrow('Base must be an integer between 2 and 36');
    expect(() => toBase(10, 2.5)).toThrow('Base must be an integer between 2 and 36');
  });

  it('소수점 숫자는 에러를 발생시켜야 합니다', () => {
    expect(() => toBase(1.5, 10)).toThrow('toBase is only defined for integers');
    expect(() => toBase(2.7, 10)).toThrow('toBase is only defined for integers');
  });

  it('특수한 값들도 처리해야 합니다', () => {
    expect(() => toBase(Infinity, 10)).toThrow('toBase is only defined for integers');
    expect(() => toBase(-Infinity, 10)).toThrow('toBase is only defined for integers');
    expect(() => toBase(NaN, 10)).toThrow('toBase is only defined for integers');
  });
});