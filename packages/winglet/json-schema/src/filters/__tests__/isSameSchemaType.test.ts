import { describe, expect, test } from 'vitest';

import type { UnknownSchema } from '../../types/jsonSchema';
import { isSameSchemaType } from '../isSameSchemaType';

describe('isSameSchemaType', () => {
  // 기본 케이스 - 동일한 단일 타입
  test('should return true for same single type', () => {
    const left: UnknownSchema = { type: 'string' };
    const right: UnknownSchema = { type: 'string' };
    expect(isSameSchemaType(left, right)).toBe(true);
  });

  test('should return true for same single numeric types', () => {
    const left: UnknownSchema = { type: 'number' };
    const right: UnknownSchema = { type: 'number' };
    expect(isSameSchemaType(left, right)).toBe(true);

    const left2: UnknownSchema = { type: 'integer' };
    const right2: UnknownSchema = { type: 'integer' };
    expect(isSameSchemaType(left2, right2)).toBe(true);
  });

  test('should return true for same single object types', () => {
    const left: UnknownSchema = { type: 'object' };
    const right: UnknownSchema = { type: 'object' };
    expect(isSameSchemaType(left, right)).toBe(true);
  });

  test('should return true for same single array types', () => {
    const left: UnknownSchema = { type: 'array' };
    const right: UnknownSchema = { type: 'array' };
    expect(isSameSchemaType(left, right)).toBe(true);
  });

  test('should return true for same single boolean types', () => {
    const left: UnknownSchema = { type: 'boolean' };
    const right: UnknownSchema = { type: 'boolean' };
    expect(isSameSchemaType(left, right)).toBe(true);
  });

  test('should return true for same single null types', () => {
    const left: UnknownSchema = { type: 'null' };
    const right: UnknownSchema = { type: 'null' };
    expect(isSameSchemaType(left, right)).toBe(true);
  });

  // 기본 케이스 - 다른 단일 타입
  test('should return false for different single types', () => {
    const left: UnknownSchema = { type: 'string' };
    const right: UnknownSchema = { type: 'number' };
    expect(isSameSchemaType(left, right)).toBe(false);
  });

  test('should return false for string vs object', () => {
    const left: UnknownSchema = { type: 'string' };
    const right: UnknownSchema = { type: 'object' };
    expect(isSameSchemaType(left, right)).toBe(false);
  });

  test('should return false for number vs array', () => {
    const left: UnknownSchema = { type: 'number' };
    const right: UnknownSchema = { type: 'array' };
    expect(isSameSchemaType(left, right)).toBe(false);
  });

  // undefined 케이스
  test('should return false when left type is undefined', () => {
    const left: UnknownSchema = {};
    const right: UnknownSchema = { type: 'string' };
    expect(isSameSchemaType(left, right)).toBe(false);
  });

  test('should return false when right type is undefined', () => {
    const left: UnknownSchema = { type: 'string' };
    const right: UnknownSchema = {};
    expect(isSameSchemaType(left, right)).toBe(false);
  });

  test('should return false when both types are undefined', () => {
    const left: UnknownSchema = {};
    const right: UnknownSchema = {};
    expect(isSameSchemaType(left, right)).toBe(false);
  });

  // 배열 타입 - 동일한 순서
  test('should return true for same array types in same order', () => {
    const left: UnknownSchema = { type: ['string', 'number'] };
    const right: UnknownSchema = { type: ['string', 'number'] };
    expect(isSameSchemaType(left, right)).toBe(true);
  });

  test('should return true for same array types with null in same order', () => {
    const left: UnknownSchema = { type: ['string', 'null'] };
    const right: UnknownSchema = { type: ['string', 'null'] };
    expect(isSameSchemaType(left, right)).toBe(true);
  });

  // 배열 타입 - 다른 순서 (하지만 같은 요소)
  test('should return true for same array types in different order', () => {
    const left: UnknownSchema = { type: ['string', 'number'] };
    const right: UnknownSchema = { type: ['number', 'string'] };
    expect(isSameSchemaType(left, right)).toBe(true);
  });

  test('should return true for complex array types in different order', () => {
    const left: UnknownSchema = { type: ['string', 'number', 'boolean', 'null'] };
    const right: UnknownSchema = { type: ['null', 'boolean', 'number', 'string'] };
    expect(isSameSchemaType(left, right)).toBe(true);
  });

  test('should return true for array types with object/array in different order', () => {
    const left: UnknownSchema = { type: ['object', 'array', 'null'] };
    const right: UnknownSchema = { type: ['null', 'object', 'array'] };
    expect(isSameSchemaType(left, right)).toBe(true);
  });

  // 배열 타입 - 다른 요소
  test('should return false for array types with different elements', () => {
    const left: UnknownSchema = { type: ['string', 'number'] };
    const right: UnknownSchema = { type: ['string', 'boolean'] };
    expect(isSameSchemaType(left, right)).toBe(false);
  });

  test('should return false when one array has extra element', () => {
    const left: UnknownSchema = { type: ['string', 'number'] };
    const right: UnknownSchema = { type: ['string', 'number', 'boolean'] };
    expect(isSameSchemaType(left, right)).toBe(false);
  });

  test('should return false when arrays have different lengths', () => {
    const left: UnknownSchema = { type: ['string'] };
    const right: UnknownSchema = { type: ['string', 'null'] };
    expect(isSameSchemaType(left, right)).toBe(false);
  });

  // 배열 타입 - 중복 요소
  test('should handle duplicate types in array correctly', () => {
    const left: UnknownSchema = { type: ['string', 'string', 'number'] };
    const right: UnknownSchema = { type: ['string', 'number', 'string'] };
    expect(isSameSchemaType(left, right)).toBe(true);
  });

  test('should return true when left has duplicates but right has all unique elements', () => {
    // 함수는 indexOf를 사용하여 요소의 존재만 확인하므로, 중복 개수는 무시됨
    // ['string', 'string']의 각 요소가 ['string', 'number']에 존재하는지만 확인
    const left: UnknownSchema = { type: ['string', 'string'] };
    const right: UnknownSchema = { type: ['string', 'number'] };
    expect(isSameSchemaType(left, right)).toBe(true); // 길이 같고, left의 모든 요소가 right에 존재
  });

  test('should return true for arrays with different duplicate counts but same unique elements', () => {
    // 길이가 같고 모든 고유 요소가 존재하면 true
    const left: UnknownSchema = { type: ['string', 'string', 'number'] };
    const right: UnknownSchema = { type: ['string', 'number', 'number'] };
    expect(isSameSchemaType(left, right)).toBe(true);
  });

  // 단일 타입 vs 배열 타입
  test('should return false when comparing single type with array type', () => {
    const left: UnknownSchema = { type: 'string' };
    const right: UnknownSchema = { type: ['string'] };
    expect(isSameSchemaType(left, right)).toBe(false);
  });

  test('should return false when comparing array type with single type', () => {
    const left: UnknownSchema = { type: ['string'] };
    const right: UnknownSchema = { type: 'string' };
    expect(isSameSchemaType(left, right)).toBe(false);
  });

  test('should return false when single type matches one element in array', () => {
    const left: UnknownSchema = { type: 'string' };
    const right: UnknownSchema = { type: ['string', 'number'] };
    expect(isSameSchemaType(left, right)).toBe(false);
  });

  // 빈 배열
  test('should handle empty arrays correctly', () => {
    const left: UnknownSchema = { type: [] };
    const right: UnknownSchema = { type: [] };
    expect(isSameSchemaType(left, right)).toBe(true);
  });

  test('should return false when comparing empty array with non-empty', () => {
    const left: UnknownSchema = { type: [] };
    const right: UnknownSchema = { type: ['string'] };
    expect(isSameSchemaType(left, right)).toBe(false);
  });

  // 특수 케이스 - 다른 속성이 있는 경우
  test('should only compare type property, ignore other properties', () => {
    const left: UnknownSchema = { type: 'string', format: 'email' };
    const right: UnknownSchema = { type: 'string', minLength: 1 };
    expect(isSameSchemaType(left, right)).toBe(true);
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
    expect(isSameSchemaType(left, right)).toBe(true);
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
    expect(isSameSchemaType(left, right)).toBe(true);
  });

  test('should work with real-world union type schemas', () => {
    const left: UnknownSchema = {
      type: ['string', 'number', 'boolean'],
      description: 'Mixed value',
    };
    const right: UnknownSchema = {
      type: ['boolean', 'string', 'number'],
    };
    expect(isSameSchemaType(left, right)).toBe(true);
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
    expect(isSameSchemaType(left, right)).toBe(false);
  });

  // P0 critical edge cases for nullable types
  describe('nullable type array syntax edge cases', () => {
    test('should return true for nullable string in both array syntaxes (order independent)', () => {
      const left: UnknownSchema = { type: ['string', 'null'] };
      const right: UnknownSchema = { type: ['null', 'string'] };
      expect(isSameSchemaType(left, right)).toBe(true);
    });

    test('should return true for nullable number in both array syntaxes', () => {
      const left: UnknownSchema = { type: ['number', 'null'] };
      const right: UnknownSchema = { type: ['null', 'number'] };
      expect(isSameSchemaType(left, right)).toBe(true);
    });

    test('should return true for nullable object in both array syntaxes', () => {
      const left: UnknownSchema = { type: ['object', 'null'] };
      const right: UnknownSchema = { type: ['null', 'object'] };
      expect(isSameSchemaType(left, right)).toBe(true);
    });

    test('should return true for nullable array type in both syntaxes', () => {
      const left: UnknownSchema = { type: ['array', 'null'] };
      const right: UnknownSchema = { type: ['null', 'array'] };
      expect(isSameSchemaType(left, right)).toBe(true);
    });

    test('should return false for single type vs nullable array syntax', () => {
      const nonNullable: UnknownSchema = { type: 'string' };
      const nullable: UnknownSchema = { type: ['string', 'null'] };
      expect(isSameSchemaType(nonNullable, nullable)).toBe(false);
    });

    test('should return false for nullable vs non-nullable array syntax', () => {
      const nullable: UnknownSchema = { type: ['string', 'null'] };
      const nonNullable: UnknownSchema = { type: ['string'] };
      expect(isSameSchemaType(nullable, nonNullable)).toBe(false);
    });

    test('should handle pure null type in single vs array syntax', () => {
      const singleNull: UnknownSchema = { type: 'null' };
      const arrayNull: UnknownSchema = { type: ['null'] };
      // Different forms (string vs array) should be considered different
      expect(isSameSchemaType(singleNull, arrayNull)).toBe(false);
    });

    test('should handle pure null type array syntax consistently', () => {
      const arrayNull1: UnknownSchema = { type: ['null'] };
      const arrayNull2: UnknownSchema = { type: ['null'] };
      expect(isSameSchemaType(arrayNull1, arrayNull2)).toBe(true);
    });
  });

  describe('nullable type validation edge cases', () => {
    test('should return false for invalid multi-type arrays (no null)', () => {
      const left: UnknownSchema = { type: ['string', 'number'] };
      const right: UnknownSchema = { type: ['string', 'boolean'] };
      // These should be different
      expect(isSameSchemaType(left, right)).toBe(false);
    });

    test('should return true for same invalid multi-type arrays', () => {
      const left: UnknownSchema = { type: ['string', 'number'] };
      const right: UnknownSchema = { type: ['number', 'string'] };
      // Even if invalid for JSON Schema, should compare consistently
      expect(isSameSchemaType(left, right)).toBe(true);
    });

    test('should handle mixed nullable and non-nullable complex types', () => {
      const nullableObject: UnknownSchema = { type: ['object', 'null'] };
      const nullableArray: UnknownSchema = { type: ['array', 'null'] };
      expect(isSameSchemaType(nullableObject, nullableArray)).toBe(false);
    });

    test('should handle triple type arrays with null', () => {
      const left: UnknownSchema = { type: ['string', 'number', 'null'] };
      const right: UnknownSchema = { type: ['null', 'string', 'number'] };
      expect(isSameSchemaType(left, right)).toBe(true);
    });

    test('should handle integer vs number in nullable contexts', () => {
      const nullableInteger: UnknownSchema = { type: ['integer', 'null'] };
      const nullableNumber: UnknownSchema = { type: ['number', 'null'] };
      // integer and number are different types
      expect(isSameSchemaType(nullableInteger, nullableNumber)).toBe(false);
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
      expect(isSameSchemaType(schema1, schema2)).toBe(true);
    });

    test('should handle nullable boolean consistently', () => {
      const left: UnknownSchema = { type: ['boolean', 'null'] };
      const right: UnknownSchema = { type: ['null', 'boolean'] };
      expect(isSameSchemaType(left, right)).toBe(true);
    });
  });
});
