import { describe, expect, test } from 'vitest';

import { intersectConst } from '../intersectConst';

describe('intersectConst', () => {
  test('returns the value when both are equal', () => {
    expect(intersectConst('value', 'value')).toBe('value');
    expect(intersectConst(42, 42)).toBe(42);
    expect(intersectConst(true, true)).toBe(true);
    expect(intersectConst(null, null)).toBe(null);
  });

  test('throws error when values are different', () => {
    expect(() => intersectConst('value1', 'value2')).toThrow(
      'Conflicting const values in schema intersection',
    );
    expect(() => intersectConst(42, 84)).toThrow(
      'Conflicting const values in schema intersection',
    );
    expect(() => intersectConst(true, false)).toThrow(
      'Conflicting const values in schema intersection',
    );
  });

  test('returns base value when only base exists', () => {
    expect(intersectConst('value', undefined)).toBe('value');
    expect(intersectConst(42, undefined)).toBe(42);
    expect(intersectConst(false, undefined)).toBe(false);
  });

  test('returns source value when only source exists', () => {
    expect(intersectConst(undefined, 'value')).toBe('value');
    expect(intersectConst(undefined, 42)).toBe(42);
    expect(intersectConst(undefined, true)).toBe(true);
  });

  test('returns undefined when both are undefined', () => {
    expect(intersectConst(undefined, undefined)).toBeUndefined();
  });

  test('object value comparison (reference equality)', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 1 };

    expect(intersectConst(obj1, obj1)).toBe(obj1); // same reference
    expect(() => intersectConst(obj1, obj2)).toThrow(
      'Conflicting const values',
    ); // different reference
  });

  test('array value comparison', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [1, 2, 3];

    expect(intersectConst(arr1, arr1)).toBe(arr1); // same reference
    expect(() => intersectConst(arr1, arr2)).toThrow(
      'Conflicting const values',
    ); // different reference
  });

  test('falsy values like 0 and false', () => {
    expect(intersectConst(0, 0)).toBe(0);
    expect(intersectConst(false, false)).toBe(false);
    expect(intersectConst('', '')).toBe('');
    expect(() => intersectConst(0, false as any)).toThrow(
      'Conflicting const values in schema intersection',
    );
  });

  test('distinguishes null and undefined', () => {
    expect(intersectConst(null, null)).toBe(null);
    expect(intersectConst(null, undefined)).toBe(null);
    expect(intersectConst(undefined, null)).toBe(null);
    expect(() => intersectConst(null, 0)).toThrow('Conflicting const values');
  });
});
