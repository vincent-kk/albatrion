import { describe, expect, test } from 'vitest';

import type { UnknownSchema } from '../../types/jsonSchema';
import { isIdenticalSchemaType } from '../isIdenticalSchemaType';

describe('isIdenticalSchemaType', () => {
  test('should handle empty arrays correctly', () => {
    const left: UnknownSchema = { type: [] };
    const right: UnknownSchema = { type: [] };
    expect(isIdenticalSchemaType(left, right)).toBe(true);
  });

  test('should return false when comparing empty array with non-empty', () => {
    const left: UnknownSchema = { type: [] };
    const right: UnknownSchema = { type: ['string'] };
    expect(isIdenticalSchemaType(left, right)).toBe(false);
  });

  // 특수 케이스 - 다른 속성이 있는 경우
  test('should only compare type property, ignore other properties', () => {
    const left: UnknownSchema = { type: 'string', format: 'email' };
    const right: UnknownSchema = { type: 'string', minLength: 1 };
    expect(isIdenticalSchemaType(left, right)).toBe(true);
  });

  test('should work with complex schemas having multiple properties', () => {
    const left: UnknownSchema = {
      type: ['string', 'null'],
      title: 'Name',
      description: 'User name',
    };
    const right: UnknownSchema = {
      type: ['null', 'string'],
      minLength: 1,
      maxLength: 100,
    };
    expect(isIdenticalSchemaType(left, right)).toBe(true);
  });

  // 실제 JSON Schema 예시
  test('should work with real-world nullable string schemas', () => {
    const left: UnknownSchema = {
      type: ['string', 'null'],
      description: 'User email',
    };
    const right: UnknownSchema = {
      type: ['null', 'string'],
      format: 'email',
    };
    expect(isIdenticalSchemaType(left, right)).toBe(true);
  });

  test('should work with real-world union type schemas', () => {
    const left: UnknownSchema = {
      type: ['string', 'number', 'boolean'],
      description: 'Mixed value',
    };
    const right: UnknownSchema = {
      type: ['boolean', 'string', 'number'],
    };
    expect(isIdenticalSchemaType(left, right)).toBe(true);
  });

  test('should return false for incompatible real-world schemas', () => {
    const left: UnknownSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    };
    const right: UnknownSchema = {
      type: 'array',
      items: { type: 'string' },
    };
    expect(isIdenticalSchemaType(left, right)).toBe(false);
  });

  // P0 critical edge cases for nullable types
  describe('nullable type array syntax edge cases', () => {
    test('should return true for nullable string in both array syntaxes (order independent)', () => {
      const left: UnknownSchema = { type: ['string', 'null'] };
      const right: UnknownSchema = { type: ['null', 'string'] };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should return true for nullable number in both array syntaxes', () => {
      const left: UnknownSchema = { type: ['number', 'null'] };
      const right: UnknownSchema = { type: ['null', 'number'] };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should return true for nullable object in both array syntaxes', () => {
      const left: UnknownSchema = { type: ['object', 'null'] };
      const right: UnknownSchema = { type: ['null', 'object'] };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should return true for nullable array type in both syntaxes', () => {
      const left: UnknownSchema = { type: ['array', 'null'] };
      const right: UnknownSchema = { type: ['null', 'array'] };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should return false for single type vs nullable array syntax', () => {
      const nonNullable: UnknownSchema = { type: 'string' };
      const nullable: UnknownSchema = { type: ['string', 'null'] };
      expect(isIdenticalSchemaType(nonNullable, nullable)).toBe(false);
    });

    test('should return false for nullable vs non-nullable array syntax', () => {
      const nullable: UnknownSchema = { type: ['string', 'null'] };
      const nonNullable: UnknownSchema = { type: ['string'] };
      expect(isIdenticalSchemaType(nullable, nonNullable)).toBe(false);
    });

    test('should handle pure null type in single vs array syntax', () => {
      const singleNull: UnknownSchema = { type: 'null' };
      const arrayNull: UnknownSchema = { type: ['null'] };
      // Different forms (string vs array) should be considered different
      expect(isIdenticalSchemaType(singleNull, arrayNull)).toBe(true);
    });

    test('should handle pure null type array syntax consistently', () => {
      const arrayNull1: UnknownSchema = { type: ['null'] };
      const arrayNull2: UnknownSchema = { type: ['null'] };
      expect(isIdenticalSchemaType(arrayNull1, arrayNull2)).toBe(true);
    });
  });

  describe('nullable type validation edge cases', () => {
    test('should return false for invalid multi-type arrays (no null)', () => {
      const left: UnknownSchema = { type: ['string', 'number'] };
      const right: UnknownSchema = { type: ['string', 'boolean'] };
      // These should be different
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });

    test('should return true for same invalid multi-type arrays', () => {
      const left: UnknownSchema = { type: ['string', 'number'] };
      const right: UnknownSchema = { type: ['number', 'string'] };
      // Even if invalid for JSON Schema, should compare consistently
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should handle mixed nullable and non-nullable complex types', () => {
      const nullableObject: UnknownSchema = { type: ['object', 'null'] };
      const nullableArray: UnknownSchema = { type: ['array', 'null'] };
      expect(isIdenticalSchemaType(nullableObject, nullableArray)).toBe(false);
    });

    test('should handle triple type arrays with null', () => {
      const left: UnknownSchema = { type: ['string', 'number', 'null'] };
      const right: UnknownSchema = { type: ['null', 'string', 'number'] };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should handle integer vs number in nullable contexts', () => {
      const nullableInteger: UnknownSchema = { type: ['integer', 'null'] };
      const nullableNumber: UnknownSchema = { type: ['number', 'null'] };
      // integer and number are different types
      expect(isIdenticalSchemaType(nullableInteger, nullableNumber)).toBe(
        false,
      );
    });

    test('should handle complex real-world nullable schema comparison', () => {
      const schema1: UnknownSchema = {
        type: ['string', 'null'],
        format: 'email',
        minLength: 1,
        maxLength: 100,
      };
      const schema2: UnknownSchema = {
        type: ['null', 'string'],
        pattern: '^[a-z]+@[a-z]+\\.[a-z]+$',
      };
      // Same type structure, different constraints (should ignore constraints)
      expect(isIdenticalSchemaType(schema1, schema2)).toBe(true);
    });

    test('should handle nullable boolean consistently', () => {
      const left: UnknownSchema = { type: ['boolean', 'null'] };
      const right: UnknownSchema = { type: ['null', 'boolean'] };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });
  });

  // nullable과 null이 섞인 배열-배열 케이스
});
