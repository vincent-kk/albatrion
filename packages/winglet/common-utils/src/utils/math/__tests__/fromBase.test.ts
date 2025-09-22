import { describe, expect, it } from 'vitest';

import { fromBase } from '../fromBase';

describe('fromBase', () => {
  it('2진법에서 10진법 변환이 올바르게 동작해야 합니다', () => {
    expect(fromBase('0', 2)).toBe(0);
    expect(fromBase('1', 2)).toBe(1);
    expect(fromBase('101', 2)).toBe(5);
    expect(fromBase('1010', 2)).toBe(10);
    expect(fromBase('11111111', 2)).toBe(255);
  });

  it('8진법에서 10진법 변환이 올바르게 동작해야 합니다', () => {
    expect(fromBase('10', 8)).toBe(8);
    expect(fromBase('100', 8)).toBe(64);
    expect(fromBase('377', 8)).toBe(255);
  });

  it('16진법에서 10진법 변환이 올바르게 동작해야 합니다', () => {
    expect(fromBase('A', 16)).toBe(10);
    expect(fromBase('F', 16)).toBe(15);
    expect(fromBase('FF', 16)).toBe(255);
    expect(fromBase('FFF', 16)).toBe(4095);
  });

  it('대소문자 모두 처리해야 합니다', () => {
    expect(fromBase('a', 16)).toBe(10);
    expect(fromBase('f', 16)).toBe(15);
    expect(fromBase('ff', 16)).toBe(255);
    expect(fromBase('AbC', 16)).toBe(2748);
  });

  it('임의의 진법에서 변환이 올바르게 동작해야 합니다', () => {
    expect(fromBase('400', 5)).toBe(100);
    expect(fromBase('202', 7)).toBe(100);
    expect(fromBase('2S', 36)).toBe(100);
  });

  it('음수 변환이 올바르게 동작해야 합니다', () => {
    expect(fromBase('-1010', 2)).toBe(-10);
    expect(fromBase('-FF', 16)).toBe(-255);
    expect(fromBase('-100', 10)).toBe(-100);
  });

  it('잘못된 진법은 에러를 발생시켜야 합니다', () => {
    expect(() => fromBase('10', 1)).toThrow('Base must be an integer between 2 and 36');
    expect(() => fromBase('10', 37)).toThrow('Base must be an integer between 2 and 36');
    expect(() => fromBase('10', 2.5)).toThrow('Base must be an integer between 2 and 36');
  });

  it('유효하지 않은 자릿수는 에러를 발생시켜야 합니다', () => {
    expect(() => fromBase('2', 2)).toThrow("Invalid digit '2' for base 2");
    expect(() => fromBase('8', 8)).toThrow("Invalid digit '8' for base 8");
    expect(() => fromBase('G', 16)).toThrow("Invalid digit 'G' for base 16");
    expect(() => fromBase('$', 36)).toThrow("Invalid digit '$' for base 36");
  });

  it('빈 문자열은 에러를 발생시켜야 합니다', () => {
    expect(() => fromBase('', 10)).toThrow('Value must be a non-empty string');
  });

  it('문자열이 아닌 값은 에러를 발생시켜야 합니다', () => {
    expect(() => fromBase(123 as any, 10)).toThrow('Value must be a non-empty string');
    expect(() => fromBase(null as any, 10)).toThrow('Value must be a non-empty string');
    expect(() => fromBase(undefined as any, 10)).toThrow('Value must be a non-empty string');
  });
});