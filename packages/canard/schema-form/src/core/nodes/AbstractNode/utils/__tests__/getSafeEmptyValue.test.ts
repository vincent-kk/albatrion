import { describe, expect, it } from 'vitest';

import { getSafeEmptyValue } from '../getSafeEmptyValue';

describe('getSafeEmptyValue', () => {
  it('should return provided value if not undefined', () => {
    expect(getSafeEmptyValue('hello', 'string')).toBe('hello');
    expect(getSafeEmptyValue(0, 'number')).toBe(0);
    expect(getSafeEmptyValue(false, 'boolean')).toBe(false);
    expect(getSafeEmptyValue(null, 'null')).toBe(null);
    expect(getSafeEmptyValue('', 'string')).toBe('');
    expect(getSafeEmptyValue([], 'array')).toEqual([]);
    expect(getSafeEmptyValue({}, 'object')).toEqual({});
  });

  it('should return empty array for array type when value is undefined', () => {
    const result = getSafeEmptyValue(undefined, 'array');

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return empty object for object type when value is undefined', () => {
    const result = getSafeEmptyValue(undefined, 'object');

    expect(result).toEqual({});
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

  it('should return undefined for string type when value is undefined', () => {
    const result = getSafeEmptyValue(undefined, 'string');

    expect(result).toBeUndefined();
  });

  it('should return undefined for number type when value is undefined', () => {
    const result = getSafeEmptyValue(undefined, 'number');

    expect(result).toBeUndefined();
  });

  it('should return undefined for boolean type when value is undefined', () => {
    const result = getSafeEmptyValue(undefined, 'boolean');

    expect(result).toBeUndefined();
  });

  it('should return undefined for null type when value is undefined', () => {
    const result = getSafeEmptyValue(undefined, 'null');

    expect(result).toBeUndefined();
  });

  it('should return undefined for integer type when value is undefined', () => {
    const result = getSafeEmptyValue(undefined, 'integer');

    expect(result).toBeUndefined();
  });

  it('should return undefined for virtual type when value is undefined', () => {
    const result = getSafeEmptyValue(undefined, 'virtual');

    expect(result).toBeUndefined();
  });

  it('should preserve existing array values', () => {
    const existingArray = [1, 2, 3];
    const result = getSafeEmptyValue(existingArray, 'array');

    expect(result).toBe(existingArray);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should preserve existing object values', () => {
    const existingObject = { name: 'test', age: 30 };
    const result = getSafeEmptyValue(existingObject, 'object');

    expect(result).toBe(existingObject);
    expect(result).toEqual({ name: 'test', age: 30 });
  });

  it('should create new instances for empty values', () => {
    const array1 = getSafeEmptyValue(undefined, 'array');
    const array2 = getSafeEmptyValue(undefined, 'array');
    const object1 = getSafeEmptyValue(undefined, 'object');
    const object2 = getSafeEmptyValue(undefined, 'object');

    expect(array1).not.toBe(array2);
    expect(object1).not.toBe(object2);
  });

  it('should handle nested value preservation', () => {
    const nestedValue = {
      level1: {
        level2: {
          data: 'preserved',
        },
      },
    };

    const result = getSafeEmptyValue(nestedValue, 'object');
    expect(result).toBe(nestedValue);
    expect(result.level1.level2.data).toBe('preserved');
  });

  it('should handle zero and falsy values correctly', () => {
    expect(getSafeEmptyValue(0, 'number')).toBe(0);
    expect(getSafeEmptyValue('', 'string')).toBe('');
    expect(getSafeEmptyValue(false, 'boolean')).toBe(false);
    expect(getSafeEmptyValue(NaN, 'number')).toBeNaN();
  });
});
