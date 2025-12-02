import { describe, expect, test } from 'vitest';

import { validateRange } from '../validateRange';

describe('validateRange', () => {
  test('valid range does not throw error', () => {
    expect(() => validateRange(5, 10)).not.toThrow();
    expect(() => validateRange(0, 100)).not.toThrow();
    expect(() => validateRange(-10, -5)).not.toThrow();
    expect(() => validateRange(-5, 5)).not.toThrow();
  });

  test('equal values are valid', () => {
    expect(() => validateRange(5, 5)).not.toThrow();
    expect(() => validateRange(0, 0)).not.toThrow();
    expect(() => validateRange(-10, -10)).not.toThrow();
  });

  test('throws error when min > max', () => {
    expect(() => validateRange(10, 5)).toThrow(
      'Invalid range: min > max (10 > 5)',
    );
    expect(() => validateRange(1, 0)).toThrow(
      'Invalid range: min > max (1 > 0)',
    );
    expect(() => validateRange(-5, -10)).toThrow(
      'Invalid range: min > max (-5 > -10)',
    );
  });

  test('custom error message', () => {
    expect(() => validateRange(10, 5, 'Custom error')).toThrow(
      'Custom error (10 > 5)',
    );
    expect(() => validateRange(100, 50, 'Length validation failed')).toThrow(
      'Length validation failed (100 > 50)',
    );
  });

  test('when only min exists (max is undefined)', () => {
    expect(() => validateRange(5, undefined)).not.toThrow();
    expect(() => validateRange(-10, undefined)).not.toThrow();
    expect(() => validateRange(0, undefined)).not.toThrow();
  });

  test('when only max exists (min is undefined)', () => {
    expect(() => validateRange(undefined, 10)).not.toThrow();
    expect(() => validateRange(undefined, -5)).not.toThrow();
    expect(() => validateRange(undefined, 0)).not.toThrow();
  });

  test('when both are undefined', () => {
    expect(() => validateRange(undefined, undefined)).not.toThrow();
  });

  test('decimal values', () => {
    expect(() => validateRange(1.5, 2.5)).not.toThrow();
    expect(() => validateRange(2.5, 1.5)).toThrow(
      'Invalid range: min > max (2.5 > 1.5)',
    );
    expect(() => validateRange(3.14, 3.14)).not.toThrow();
  });

  test('zero and negative number combinations', () => {
    expect(() => validateRange(-5, 0)).not.toThrow();
    expect(() => validateRange(0, -5)).toThrow(
      'Invalid range: min > max (0 > -5)',
    );
    expect(() => validateRange(-10, -1)).not.toThrow();
  });

  test('very large numbers', () => {
    expect(() => validateRange(100, Number.MAX_VALUE)).not.toThrow();
    expect(() => validateRange(Number.MAX_VALUE, 100)).toThrow(
      `Invalid range: min > max (${Number.MAX_VALUE} > 100)`,
    );
  });

  test('infinite values', () => {
    expect(() => validateRange(-Infinity, Infinity)).not.toThrow();
    expect(() => validateRange(Infinity, -Infinity)).toThrow(
      'Invalid range: min > max (Infinity > -Infinity)',
    );
    expect(() => validateRange(100, Infinity)).not.toThrow();
    expect(() => validateRange(Infinity, 100)).toThrow(
      'Invalid range: min > max (Infinity > 100)',
    );
  });

  test('various custom messages', () => {
    const testCases = [
      ['String length error', 10, 5],
      ['Array size error', 100, 50],
      ['Number range error', 1000, 500],
    ] as const;

    testCases.forEach(([message, min, max]) => {
      expect(() => validateRange(min, max, message)).toThrow(
        `${message} (${min} > ${max})`,
      );
    });
  });
});
