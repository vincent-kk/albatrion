import { describe, it, expect } from 'vitest';
import { dataCondition } from '../dataCondition';

describe('dataCondition', () => {
  it('true 조건일 때 true를 반환해야 합니다', () => {
    const result = dataCondition(true);
    expect(result).toBe(true);
  });

  it('false 조건일 때 undefined를 반환해야 합니다', () => {
    const result = dataCondition(false);
    expect(result).toBe(undefined);
  });

  it('truthy 값들에 대해 올바르게 처리해야 합니다', () => {
    expect(dataCondition(Boolean('non-empty string'))).toBe(true);
    expect(dataCondition(Boolean(1))).toBe(true);
    expect(dataCondition(Boolean(42))).toBe(true);
    expect(dataCondition(Boolean({}))).toBe(true);
    expect(dataCondition(Boolean([]))).toBe(true);
  });

  it('falsy 값들에 대해 올바르게 처리해야 합니다', () => {
    expect(dataCondition(Boolean(''))).toBe(undefined);
    expect(dataCondition(Boolean(0))).toBe(undefined);
    expect(dataCondition(Boolean(null))).toBe(undefined);
    expect(dataCondition(Boolean(undefined))).toBe(undefined);
    expect(dataCondition(Boolean(NaN))).toBe(undefined);
  });
});
