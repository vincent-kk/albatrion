import { describe, expect, it } from 'vitest';

import { isArrayIndex } from '../isArrayIndex';

describe('isArrayIndex', () => {
  // Valid array indices
  it('should return true for valid array indices as strings', () => {
    expect(isArrayIndex('0')).toBe(true);
    expect(isArrayIndex('1')).toBe(true);
    expect(isArrayIndex('42')).toBe(true);
    expect(isArrayIndex('999999')).toBe(true);
  });

  it('should return true for indices up to 0xffffffff - 1', () => {
    expect(isArrayIndex('4294967294')).toBe(true); // 0xffffffff - 1
  });

  // Invalid array indices
  it('should return false for empty string', () => {
    expect(isArrayIndex('')).toBe(false);
  });

  it('should return false for negative numbers', () => {
    expect(isArrayIndex('-1')).toBe(false);
    expect(isArrayIndex('-42')).toBe(false);
  });

  it('should return false for non-numeric strings', () => {
    expect(isArrayIndex('abc')).toBe(false);
    expect(isArrayIndex('1.5')).toBe(false);
  });

  it('should return false for numbers exceeding array index limit', () => {
    expect(isArrayIndex('4294967295')).toBe(false); // 0xffffffff
    expect(isArrayIndex('4294967296')).toBe(false); // 0xffffffff + 1
  });

  it('should return true for valid number formats', () => {
    expect(isArrayIndex('00')).toBe(true); // Leading zero
    expect(isArrayIndex('+1')).toBe(true); // Explicit positive sign
    expect(isArrayIndex('1.')).toBe(true); // Trailing decimal point
    expect(isArrayIndex('1e5')).toBe(true);
  });
});
