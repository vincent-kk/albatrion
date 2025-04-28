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
    expect(isArrayIndex('4294967295')).toBe(true); // 0xffffffff
    expect(isArrayIndex('4294967296')).toBe(true); // 0xffffffff + 1
  });

  it('should return true for valid number formats', () => {
    expect(isArrayIndex('00')).toBe(true); // Leading zero
    expect(isArrayIndex('+1')).toBe(false); // Explicit positive sign
    expect(isArrayIndex('1.')).toBe(false); // Trailing decimal point
    expect(isArrayIndex('1e5')).toBe(false);
  });

  // Arrange: Positive Test Cases
  const validIntegers = ['0', '1', '123', '9876543210'];

  validIntegers.forEach((value) => {
    it(`should return true for a valid string integer "${value}"`, () => {
      // Act
      const result = isArrayIndex(value);
      // Assert
      expect(result).toBe(true);
    });
  });

  // Arrange: Negative Test Cases
  const invalidInputs = [
    '', // Empty string
    ' ', // Whitespace
    'a', // Alphabet character
    '1a2', // Mixed characters
    '-1', // Negative sign
    '1.0', // Decimal point
    '1e3', // Scientific notation
    '１２３', // Full-width numbers
    'Infinity',
    'NaN',
    'null',
    'undefined',
  ];

  invalidInputs.forEach((value) => {
    it(`should return false for an invalid input "${value}"`, () => {
      // Act
      const result = isArrayIndex(value);
      // Assert
      expect(result).toBe(false);
    });
  });

  it('should return false for a string containing only non-digit characters', () => {
    // Arrange
    const value = 'abc';
    // Act
    const result = isArrayIndex(value);
    // Assert
    expect(result).toBe(false);
  });

  it('should return false for a string starting with non-digit characters', () => {
    // Arrange
    const value = 'a123';
    // Act
    const result = isArrayIndex(value);
    // Assert
    expect(result).toBe(false);
  });

  it('should return false for a string ending with non-digit characters', () => {
    // Arrange
    const value = '123a';
    // Act
    const result = isArrayIndex(value);
    // Assert
    expect(result).toBe(false);
  });
});
