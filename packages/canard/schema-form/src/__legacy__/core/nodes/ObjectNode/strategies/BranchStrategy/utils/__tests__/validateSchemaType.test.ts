import { describe, expect, it } from 'vitest';

import { validateSchemaType } from '../validateSchemaType/validateSchemaType';

describe('validateSchemaType', () => {
  describe('null type', () => {
    it('should return true for null value with null schema type', () => {
      expect(validateSchemaType(null, 'null', false)).toBe(true);
    });

    it('should return false for null value with non-null schema type when not nullable', () => {
      expect(validateSchemaType(null, 'string', false)).toBe(false);
      expect(validateSchemaType(null, 'number', false)).toBe(false);
      expect(validateSchemaType(null, 'boolean', false)).toBe(false);
      expect(validateSchemaType(null, 'object', false)).toBe(false);
      expect(validateSchemaType(null, 'array', false)).toBe(false);
    });

    it('should return false for non-null value with null schema type', () => {
      expect(validateSchemaType('string', 'null', false)).toBe(false);
      expect(validateSchemaType(123, 'null', false)).toBe(false);
      expect(validateSchemaType(true, 'null', false)).toBe(false);
      expect(validateSchemaType({}, 'null', false)).toBe(false);
      expect(validateSchemaType([], 'null', false)).toBe(false);
    });
  });

  describe('array type', () => {
    it('should return true for array value with array schema type', () => {
      expect(validateSchemaType([], 'array', false)).toBe(true);
      expect(validateSchemaType([1, 2, 3], 'array', false)).toBe(true);
      expect(validateSchemaType(['a', 'b'], 'array', false)).toBe(true);
      expect(validateSchemaType([{ key: 'value' }], 'array', false)).toBe(true);
    });

    it('should return false for array value with non-array schema type', () => {
      expect(validateSchemaType([], 'object', false)).toBe(false);
      expect(validateSchemaType([], 'string', false)).toBe(false);
      expect(validateSchemaType([], 'number', false)).toBe(false);
      expect(validateSchemaType([], 'boolean', false)).toBe(false);
    });

    it('should return false for non-array value with array schema type', () => {
      expect(validateSchemaType({}, 'array', false)).toBe(false);
      expect(validateSchemaType('string', 'array', false)).toBe(false);
      expect(validateSchemaType(123, 'array', false)).toBe(false);
      expect(validateSchemaType(true, 'array', false)).toBe(false);
    });
  });

  describe('object type', () => {
    it('should return true for object value with object schema type', () => {
      expect(validateSchemaType({}, 'object', false)).toBe(true);
      expect(validateSchemaType({ key: 'value' }, 'object', false)).toBe(true);
      expect(
        validateSchemaType({ nested: { obj: true } }, 'object', false),
      ).toBe(true);
    });

    it('should return false for object value with non-object schema type', () => {
      expect(validateSchemaType({}, 'string', false)).toBe(false);
      expect(validateSchemaType({}, 'number', false)).toBe(false);
      expect(validateSchemaType({}, 'boolean', false)).toBe(false);
      expect(validateSchemaType({}, 'array', false)).toBe(false);
    });

    it('should return false for non-object value with object schema type', () => {
      expect(validateSchemaType('string', 'object', false)).toBe(false);
      expect(validateSchemaType(123, 'object', false)).toBe(false);
      expect(validateSchemaType(true, 'object', false)).toBe(false);
      expect(validateSchemaType([], 'object', false)).toBe(false);
      expect(validateSchemaType(null, 'object', false)).toBe(false);
    });
  });

  describe('string type', () => {
    it('should return true for string value with string schema type', () => {
      expect(validateSchemaType('', 'string', false)).toBe(true);
      expect(validateSchemaType('hello', 'string', false)).toBe(true);
      expect(validateSchemaType('Hello World', 'string', false)).toBe(true);
    });

    it('should return false for string value with non-string schema type', () => {
      expect(validateSchemaType('hello', 'number', false)).toBe(false);
      expect(validateSchemaType('hello', 'boolean', false)).toBe(false);
      expect(validateSchemaType('hello', 'object', false)).toBe(false);
      expect(validateSchemaType('hello', 'array', false)).toBe(false);
    });

    it('should return false for non-string value with string schema type', () => {
      expect(validateSchemaType(123, 'string', false)).toBe(false);
      expect(validateSchemaType(true, 'string', false)).toBe(false);
      expect(validateSchemaType({}, 'string', false)).toBe(false);
      expect(validateSchemaType([], 'string', false)).toBe(false);
      expect(validateSchemaType(null, 'string', false)).toBe(false);
    });
  });

  describe('number type', () => {
    it('should return true for number value with number schema type', () => {
      expect(validateSchemaType(0, 'number', false)).toBe(true);
      expect(validateSchemaType(42, 'number', false)).toBe(true);
      expect(validateSchemaType(-10, 'number', false)).toBe(true);
      expect(validateSchemaType(3.14, 'number', false)).toBe(true);
      expect(validateSchemaType(-0.5, 'number', false)).toBe(true);
    });

    it('should return false for number value with non-number schema type', () => {
      expect(validateSchemaType(123, 'string', false)).toBe(false);
      expect(validateSchemaType(123, 'boolean', false)).toBe(false);
      expect(validateSchemaType(123, 'object', false)).toBe(false);
      expect(validateSchemaType(123, 'array', false)).toBe(false);
    });

    it('should return false for non-number value with number schema type', () => {
      expect(validateSchemaType('string', 'number', false)).toBe(false);
      expect(validateSchemaType(true, 'number', false)).toBe(false);
      expect(validateSchemaType({}, 'number', false)).toBe(false);
      expect(validateSchemaType([], 'number', false)).toBe(false);
      expect(validateSchemaType(null, 'number', false)).toBe(false);
    });

    it('should accept both integers and floats for number type', () => {
      expect(validateSchemaType(42, 'number', false)).toBe(true); // integer
      expect(validateSchemaType(3.14, 'number', false)).toBe(true); // float
      expect(validateSchemaType(0.1 + 0.2, 'number', false)).toBe(true); // float arithmetic result
    });
  });

  describe('boolean type', () => {
    it('should return true for boolean value with boolean schema type', () => {
      expect(validateSchemaType(true, 'boolean', false)).toBe(true);
      expect(validateSchemaType(false, 'boolean', false)).toBe(true);
    });

    it('should return false for boolean value with non-boolean schema type', () => {
      expect(validateSchemaType(true, 'string', false)).toBe(false);
      expect(validateSchemaType(true, 'number', false)).toBe(false);
      expect(validateSchemaType(true, 'object', false)).toBe(false);
      expect(validateSchemaType(true, 'array', false)).toBe(false);
    });

    it('should return false for non-boolean value with boolean schema type', () => {
      expect(validateSchemaType('string', 'boolean', false)).toBe(false);
      expect(validateSchemaType(123, 'boolean', false)).toBe(false);
      expect(validateSchemaType({}, 'boolean', false)).toBe(false);
      expect(validateSchemaType([], 'boolean', false)).toBe(false);
      expect(validateSchemaType(null, 'boolean', false)).toBe(false);
    });

    it('should not accept truthy/falsy values', () => {
      expect(validateSchemaType(1, 'boolean', false)).toBe(false);
      expect(validateSchemaType(0, 'boolean', false)).toBe(false);
      expect(validateSchemaType('', 'boolean', false)).toBe(false);
      expect(validateSchemaType('true', 'boolean', false)).toBe(false);
    });
  });

  describe('undefined handling', () => {
    it('should return false for undefined value regardless of schema type', () => {
      expect(validateSchemaType(undefined, 'string', false)).toBe(false);
      expect(validateSchemaType(undefined, 'number', false)).toBe(false);
      expect(validateSchemaType(undefined, 'boolean', false)).toBe(false);
      expect(validateSchemaType(undefined, 'object', false)).toBe(false);
      expect(validateSchemaType(undefined, 'array', false)).toBe(false);
      expect(validateSchemaType(undefined, 'null', false)).toBe(false);
    });

    it('should return false for undefined value even with nullable', () => {
      expect(validateSchemaType(undefined, 'string', true)).toBe(false);
      expect(validateSchemaType(undefined, 'number', true)).toBe(false);
      expect(validateSchemaType(undefined, 'boolean', true)).toBe(false);
      expect(validateSchemaType(undefined, 'object', true)).toBe(false);
      expect(validateSchemaType(undefined, 'array', true)).toBe(false);
      expect(validateSchemaType(undefined, 'null', true)).toBe(false);
    });
  });

  describe('nullable option', () => {
    it('should return true for null value with nullable true regardless of type', () => {
      expect(validateSchemaType(null, 'string', true)).toBe(true);
      expect(validateSchemaType(null, 'number', true)).toBe(true);
      expect(validateSchemaType(null, 'boolean', true)).toBe(true);
      expect(validateSchemaType(null, 'object', true)).toBe(true);
      expect(validateSchemaType(null, 'array', true)).toBe(true);
    });

    it('should return false for null value with nullable false', () => {
      expect(validateSchemaType(null, 'string', false)).toBe(false);
      expect(validateSchemaType(null, 'number', false)).toBe(false);
      expect(validateSchemaType(null, 'boolean', false)).toBe(false);
      expect(validateSchemaType(null, 'object', false)).toBe(false);
      expect(validateSchemaType(null, 'array', false)).toBe(false);
    });

    it('should return true for null value with null type regardless of nullable', () => {
      expect(validateSchemaType(null, 'null', false)).toBe(true);
      expect(validateSchemaType(null, 'null', true)).toBe(true);
    });

    it('should not affect non-null values', () => {
      expect(validateSchemaType('hello', 'string', true)).toBe(true);
      expect(validateSchemaType(123, 'number', true)).toBe(true);
      expect(validateSchemaType(true, 'boolean', true)).toBe(true);
      expect(validateSchemaType({}, 'object', true)).toBe(true);
      expect(validateSchemaType([], 'array', true)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle special numbers correctly', () => {
      expect(validateSchemaType(Infinity, 'number', false)).toBe(true);
      expect(validateSchemaType(-Infinity, 'number', false)).toBe(true);
      expect(validateSchemaType(NaN, 'number', false)).toBe(true);
    });

    it('should distinguish between null and object', () => {
      expect(validateSchemaType(null, 'object', false)).toBe(false);
      expect(validateSchemaType(null, 'null', false)).toBe(true);
    });

    it('should distinguish between array and object', () => {
      expect(validateSchemaType([], 'object', false)).toBe(false);
      expect(validateSchemaType([], 'array', false)).toBe(true);
    });

    it('should handle empty values correctly', () => {
      expect(validateSchemaType('', 'string', false)).toBe(true);
      expect(validateSchemaType([], 'array', false)).toBe(true);
      expect(validateSchemaType({}, 'object', false)).toBe(true);
      expect(validateSchemaType(0, 'number', false)).toBe(true);
    });
  });
});
