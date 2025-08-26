import { describe, expect, it } from 'vitest';

import { getSafeEmptyValue } from '../getSafeEmptyValue';

describe('getSafeEmptyValue', () => {
  it('should return provided value if not undefined', () => {
    const schema = { type: 'string' };

    expect(getSafeEmptyValue('hello', schema)).toBe('hello');
    expect(getSafeEmptyValue(0, schema)).toBe(0);
    expect(getSafeEmptyValue(false, schema)).toBe(false);
    expect(getSafeEmptyValue(null, schema)).toBe(null);
    expect(getSafeEmptyValue('', schema)).toBe('');
    expect(getSafeEmptyValue([], schema)).toEqual([]);
    expect(getSafeEmptyValue({}, schema)).toEqual({});
  });

  it('should return empty array for array type when value is undefined', () => {
    const schema = { type: 'array' };
    const result = getSafeEmptyValue(undefined, schema);

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return empty object for object type when value is undefined', () => {
    const schema = { type: 'object' };
    const result = getSafeEmptyValue(undefined, schema);

    expect(result).toEqual({});
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

  it('should return undefined for string type when value is undefined', () => {
    const schema = { type: 'string' };
    const result = getSafeEmptyValue(undefined, schema);

    expect(result).toBeUndefined();
  });

  it('should return undefined for number type when value is undefined', () => {
    const schema = { type: 'number' };
    const result = getSafeEmptyValue(undefined, schema);

    expect(result).toBeUndefined();
  });

  it('should return undefined for boolean type when value is undefined', () => {
    const schema = { type: 'boolean' };
    const result = getSafeEmptyValue(undefined, schema);

    expect(result).toBeUndefined();
  });

  it('should return undefined for null type when value is undefined', () => {
    const schema = { type: 'null' };
    const result = getSafeEmptyValue(undefined, schema);

    expect(result).toBeUndefined();
  });

  it('should return undefined for integer type when value is undefined', () => {
    const schema = { type: 'integer' };
    const result = getSafeEmptyValue(undefined, schema);

    expect(result).toBeUndefined();
  });

  it('should return undefined for virtual type when value is undefined', () => {
    const schema = { type: 'virtual' };
    const result = getSafeEmptyValue(undefined, schema);

    expect(result).toBeUndefined();
  });

  it('should return undefined for schema without type when value is undefined', () => {
    const schema = {};
    const result = getSafeEmptyValue(undefined, schema);

    expect(result).toBeUndefined();
  });

  it('should preserve existing array values', () => {
    const schema = { type: 'array' };
    const existingArray = [1, 2, 3];
    const result = getSafeEmptyValue(existingArray, schema);

    expect(result).toBe(existingArray);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should preserve existing object values', () => {
    const schema = { type: 'object' };
    const existingObject = { name: 'test', age: 30 };
    const result = getSafeEmptyValue(existingObject, schema);

    expect(result).toBe(existingObject);
    expect(result).toEqual({ name: 'test', age: 30 });
  });

  it('should handle complex array schemas', () => {
    const schema = {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
    };
    const result = getSafeEmptyValue(undefined, schema);

    expect(result).toEqual([]);
  });

  it('should handle complex object schemas', () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
      required: ['name'],
    };
    const result = getSafeEmptyValue(undefined, schema);

    expect(result).toEqual({});
  });

  it('should not modify the original schema', () => {
    const schema = { type: 'array' };
    const originalSchema = { ...schema };

    getSafeEmptyValue(undefined, schema);

    expect(schema).toEqual(originalSchema);
  });

  it('should create new instances for empty values', () => {
    const arraySchema = { type: 'array' };
    const objectSchema = { type: 'object' };

    const array1 = getSafeEmptyValue(undefined, arraySchema);
    const array2 = getSafeEmptyValue(undefined, arraySchema);
    const object1 = getSafeEmptyValue(undefined, objectSchema);
    const object2 = getSafeEmptyValue(undefined, objectSchema);

    expect(array1).not.toBe(array2);
    expect(object1).not.toBe(object2);
  });

  it('should handle schema with additional properties', () => {
    const arraySchema = {
      type: 'array',
      default: ['default'],
      title: 'Array Field',
    };
    const objectSchema = {
      type: 'object',
      default: { key: 'value' },
      title: 'Object Field',
    };

    // Note: This function doesn't use the default property
    expect(getSafeEmptyValue(undefined, arraySchema)).toEqual([]);
    expect(getSafeEmptyValue(undefined, objectSchema)).toEqual({});
  });

  it('should handle nested value preservation', () => {
    const schema = { type: 'object' };
    const nestedValue = {
      level1: {
        level2: {
          data: 'preserved',
        },
      },
    };

    const result = getSafeEmptyValue(nestedValue, schema);
    expect(result).toBe(nestedValue);
    expect(result.level1.level2.data).toBe('preserved');
  });

  it('should handle zero and falsy values correctly', () => {
    const numberSchema = { type: 'number' };
    const stringSchema = { type: 'string' };
    const booleanSchema = { type: 'boolean' };

    expect(getSafeEmptyValue(0, numberSchema)).toBe(0);
    expect(getSafeEmptyValue('', stringSchema)).toBe('');
    expect(getSafeEmptyValue(false, booleanSchema)).toBe(false);
    expect(getSafeEmptyValue(NaN, numberSchema)).toBeNaN();
  });
});
