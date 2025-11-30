import { describe, expect, test } from 'vitest';

import type { UnknownSchema } from '../../types/jsonSchema';
import { isIdenticalSchemaType } from '../isIdenticalSchemaType';

describe('isIdenticalSchemaType', () => {
  // 기본 케이스 - 동일한 단일 타입
  test('should return true for same single type', () => {
    const left: UnknownSchema = { type: 'string' };
    const right: UnknownSchema = { type: 'string' };
    expect(isIdenticalSchemaType(left, right)).toBe(true);
  });

  test('should return true for same single numeric types', () => {
    const left: UnknownSchema = { type: 'number' };
    const right: UnknownSchema = { type: 'number' };
    expect(isIdenticalSchemaType(left, right)).toBe(true);

    const left2: UnknownSchema = { type: 'integer' };
    const right2: UnknownSchema = { type: 'integer' };
    expect(isIdenticalSchemaType(left2, right2)).toBe(true);
  });

  test('should return true for same single object types', () => {
    const left: UnknownSchema = { type: 'object' };
    const right: UnknownSchema = { type: 'object' };
    expect(isIdenticalSchemaType(left, right)).toBe(true);
  });

  test('should return true for same single array types', () => {
    const left: UnknownSchema = { type: 'array' };
    const right: UnknownSchema = { type: 'array' };
    expect(isIdenticalSchemaType(left, right)).toBe(true);
  });

  test('should return true for same single boolean types', () => {
    const left: UnknownSchema = { type: 'boolean' };
    const right: UnknownSchema = { type: 'boolean' };
    expect(isIdenticalSchemaType(left, right)).toBe(true);
  });

  test('should return true for same single null types', () => {
    const left: UnknownSchema = { type: 'null' };
    const right: UnknownSchema = { type: 'null' };
    expect(isIdenticalSchemaType(left, right)).toBe(true);
  });

  // 기본 케이스 - 다른 단일 타입
  test('should return false for different single types', () => {
    const left: UnknownSchema = { type: 'string' };
    const right: UnknownSchema = { type: 'number' };
    expect(isIdenticalSchemaType(left, right)).toBe(false);
  });

  test('should return false for string vs object', () => {
    const left: UnknownSchema = { type: 'string' };
    const right: UnknownSchema = { type: 'object' };
    expect(isIdenticalSchemaType(left, right)).toBe(false);
  });

  test('should return false for number vs array', () => {
    const left: UnknownSchema = { type: 'number' };
    const right: UnknownSchema = { type: 'array' };
    expect(isIdenticalSchemaType(left, right)).toBe(false);
  });

  // undefined 케이스
  test('should return false when left type is undefined', () => {
    const left: UnknownSchema = {};
    const right: UnknownSchema = { type: 'string' };
    expect(isIdenticalSchemaType(left, right)).toBe(false);
  });

  test('should return false when right type is undefined', () => {
    const left: UnknownSchema = { type: 'string' };
    const right: UnknownSchema = {};
    expect(isIdenticalSchemaType(left, right)).toBe(false);
  });

  test('should return false when both types are undefined', () => {
    const left: UnknownSchema = {};
    const right: UnknownSchema = {};
    expect(isIdenticalSchemaType(left, right)).toBe(false);
  });

  // 배열 타입 - 동일한 순서
  test('should return true for same array types in same order', () => {
    const left: UnknownSchema = { type: ['string', 'number'] };
    const right: UnknownSchema = { type: ['string', 'number'] };
    expect(isIdenticalSchemaType(left, right)).toBe(true);
  });

  test('should return true for same array types with null in same order', () => {
    const left: UnknownSchema = { type: ['string', 'null'] };
    const right: UnknownSchema = { type: ['string', 'null'] };
    expect(isIdenticalSchemaType(left, right)).toBe(true);
  });

  // 배열 타입 - 다른 순서 (하지만 같은 요소)
  test('should return true for same array types in different order', () => {
    const left: UnknownSchema = { type: ['string', 'number'] };
    const right: UnknownSchema = { type: ['number', 'string'] };
    expect(isIdenticalSchemaType(left, right)).toBe(true);
  });

  test('should return true for complex array types in different order', () => {
    const left: UnknownSchema = {
      type: ['string', 'number', 'boolean', 'null'],
    };
    const right: UnknownSchema = {
      type: ['null', 'boolean', 'number', 'string'],
    };
    expect(isIdenticalSchemaType(left, right)).toBe(true);
  });

  test('should return true for array types with object/array in different order', () => {
    const left: UnknownSchema = { type: ['object', 'array', 'null'] };
    const right: UnknownSchema = { type: ['null', 'object', 'array'] };
    expect(isIdenticalSchemaType(left, right)).toBe(true);
  });

  // 배열 타입 - 다른 요소
  test('should return false for array types with different elements', () => {
    const left: UnknownSchema = { type: ['string', 'number'] };
    const right: UnknownSchema = { type: ['string', 'boolean'] };
    expect(isIdenticalSchemaType(left, right)).toBe(false);
  });

  test('should return false when one array has extra element', () => {
    const left: UnknownSchema = { type: ['string', 'number'] };
    const right: UnknownSchema = { type: ['string', 'number', 'boolean'] };
    expect(isIdenticalSchemaType(left, right)).toBe(false);
  });

  test('should return false when arrays have different lengths', () => {
    const left: UnknownSchema = { type: ['string'] };
    const right: UnknownSchema = { type: ['string', 'null'] };
    expect(isIdenticalSchemaType(left, right)).toBe(false);
  });

  // 배열 타입 - 중복 요소
  test('should handle duplicate types in array correctly', () => {
    const left: UnknownSchema = { type: ['string', 'string', 'number'] };
    const right: UnknownSchema = { type: ['string', 'number', 'string'] };
    expect(isIdenticalSchemaType(left, right)).toBe(true);
  });

  test('should return true when left has duplicates but right has all unique elements', () => {
    // 함수는 indexOf를 사용하여 요소의 존재만 확인하므로, 중복 개수는 무시됨
    // ['string', 'string']의 각 요소가 ['string', 'number']에 존재하는지만 확인
    const left: UnknownSchema = { type: ['string', 'string'] };
    const right: UnknownSchema = { type: ['string', 'number'] };
    expect(isIdenticalSchemaType(left, right)).toBe(true); // 길이 같고, left의 모든 요소가 right에 존재
  });

  test('should return true for arrays with different duplicate counts but same unique elements', () => {
    // 길이가 같고 모든 고유 요소가 존재하면 true
    const left: UnknownSchema = { type: ['string', 'string', 'number'] };
    const right: UnknownSchema = { type: ['string', 'number', 'number'] };
    expect(isIdenticalSchemaType(left, right)).toBe(true);
  });

  // 단일 타입 vs 배열 타입
  test('should return false when comparing single type with array type', () => {
    const left: UnknownSchema = { type: 'string' };
    const right: UnknownSchema = { type: ['string'] };
    expect(isIdenticalSchemaType(left, right)).toBe(true);
  });

  test('should return false when comparing array type with single type', () => {
    const left: UnknownSchema = { type: ['string'] };
    const right: UnknownSchema = { type: 'string' };
    expect(isIdenticalSchemaType(left, right)).toBe(true);
  });

  test('should return false when single type matches one element in array', () => {
    const left: UnknownSchema = { type: 'string' };
    const right: UnknownSchema = { type: ['string', 'number'] };
    expect(isIdenticalSchemaType(left, right)).toBe(false);
  });

  // null 단일 타입 vs 배열
  describe('null single type vs array', () => {
    test('should return false for null single vs nullable array with other type', () => {
      const left: UnknownSchema = { type: 'null' };
      const right: UnknownSchema = { type: ['string', 'null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });

    test('should return false for nullable array vs null single', () => {
      const left: UnknownSchema = { type: ['string', 'null'] };
      const right: UnknownSchema = { type: 'null' };
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });

    test('should return true for null single vs [null]', () => {
      const left: UnknownSchema = { type: 'null' };
      const right: UnknownSchema = { type: ['null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should return true for [null] vs null single', () => {
      const left: UnknownSchema = { type: ['null'] };
      const right: UnknownSchema = { type: 'null' };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should return false for null single vs multi-type nullable array', () => {
      const left: UnknownSchema = { type: 'null' };
      const right: UnknownSchema = { type: ['string', 'number', 'null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });
  });

  // 빈 배열
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
  describe('nullable and null mixed array-array cases', () => {
    // 기본: 양쪽 모두 nullable 배열 (동일)
    test('should return true for identical nullable arrays', () => {
      const left: UnknownSchema = { type: ['string', 'null'] };
      const right: UnknownSchema = { type: ['string', 'null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should return true for nullable arrays with null in different positions', () => {
      const left: UnknownSchema = { type: ['null', 'string'] };
      const right: UnknownSchema = { type: ['string', 'null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    // 다중 타입 + nullable
    test('should return true for multi-type nullable arrays with same types', () => {
      const left: UnknownSchema = { type: ['string', 'number', 'null'] };
      const right: UnknownSchema = { type: ['number', 'string', 'null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should return true for multi-type nullable arrays with null in different positions', () => {
      const left: UnknownSchema = { type: ['null', 'string', 'number'] };
      const right: UnknownSchema = { type: ['string', 'null', 'number'] };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should return true for multi-type with null at beginning vs end', () => {
      const left: UnknownSchema = { type: ['null', 'string', 'number'] };
      const right: UnknownSchema = { type: ['string', 'number', 'null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should return true for multi-type with null in middle vs end', () => {
      const left: UnknownSchema = { type: ['string', 'null', 'number'] };
      const right: UnknownSchema = { type: ['string', 'number', 'null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    // nullable vs non-nullable 배열 (비동일)
    test('should return false for nullable vs non-nullable array', () => {
      const left: UnknownSchema = { type: ['string', 'number', 'null'] };
      const right: UnknownSchema = { type: ['string', 'number'] };
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });

    test('should return false for non-nullable vs nullable array', () => {
      const left: UnknownSchema = { type: ['string', 'number'] };
      const right: UnknownSchema = { type: ['number', 'string', 'null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });

    // integer vs number (비동일 - isIdentical에서는 다른 타입)
    test('should return false for integer vs number in nullable arrays', () => {
      const left: UnknownSchema = { type: ['integer', 'null'] };
      const right: UnknownSchema = { type: ['number', 'null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });

    test('should return false for integer vs number in multi-type nullable arrays', () => {
      const left: UnknownSchema = { type: ['integer', 'string', 'null'] };
      const right: UnknownSchema = { type: ['number', 'string', 'null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });

    // null-only 배열 vs nullable 배열
    test('should return false for [null] vs nullable array with other type', () => {
      const left: UnknownSchema = { type: ['null'] };
      const right: UnknownSchema = { type: ['string', 'null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });

    test('should return false for nullable array vs [null]', () => {
      const left: UnknownSchema = { type: ['string', 'null'] };
      const right: UnknownSchema = { type: ['null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });

    test('should return true for [null] vs [null]', () => {
      const left: UnknownSchema = { type: ['null'] };
      const right: UnknownSchema = { type: ['null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    // 비호환 케이스
    test('should return false for different base types in nullable arrays', () => {
      const left: UnknownSchema = { type: ['string', 'null'] };
      const right: UnknownSchema = { type: ['number', 'null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });

    test('should return false for partially matching multi-type nullable arrays', () => {
      const left: UnknownSchema = { type: ['string', 'number', 'null'] };
      const right: UnknownSchema = { type: ['string', 'boolean', 'null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });

    // object, array 타입과 nullable
    test('should return true for identical nullable object arrays', () => {
      const left: UnknownSchema = { type: ['object', 'null'] };
      const right: UnknownSchema = { type: ['null', 'object'] };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should return true for identical nullable array type arrays', () => {
      const left: UnknownSchema = { type: ['array', 'null'] };
      const right: UnknownSchema = { type: ['null', 'array'] };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should return false for object vs array in nullable context', () => {
      const left: UnknownSchema = { type: ['object', 'null'] };
      const right: UnknownSchema = { type: ['array', 'null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });

    // 4개 이상의 타입
    test('should return true for identical 4+ types with nullable', () => {
      const left: UnknownSchema = { type: ['string', 'number', 'boolean', 'object', 'null'] };
      const right: UnknownSchema = { type: ['null', 'object', 'boolean', 'number', 'string'] };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should return false for 4+ types with one type difference', () => {
      const left: UnknownSchema = { type: ['string', 'number', 'boolean', 'object', 'null'] };
      const right: UnknownSchema = { type: ['string', 'number', 'boolean', 'array', 'null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });

    test('should return false for 4+ types vs 3 types (different count)', () => {
      const left: UnknownSchema = { type: ['string', 'number', 'boolean', 'null'] };
      const right: UnknownSchema = { type: ['string', 'number', 'null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });

    // nullable:true 속성 + 배열의 null 혼합
    test('should return true for nullable array vs nullable property with array including null', () => {
      const left: UnknownSchema = { type: ['string', 'null'], nullable: true };
      const right: UnknownSchema = { type: ['string', 'null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should return true for nullable:true + [type] vs [type, null]', () => {
      const left: UnknownSchema = { type: ['string'], nullable: true };
      const right: UnknownSchema = { type: ['string', 'null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should return true for [type, null] vs nullable:true + [type]', () => {
      const left: UnknownSchema = { type: ['string', 'null'] };
      const right: UnknownSchema = { type: ['string'], nullable: true };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    // 다중 타입 배열 + nullable:true
    test('should return true for multi-type array with nullable:true vs with null in array', () => {
      const left: UnknownSchema = { type: ['string', 'number'], nullable: true };
      const right: UnknownSchema = { type: ['string', 'number', 'null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should return true for multi-type array with null vs nullable:true', () => {
      const left: UnknownSchema = { type: ['string', 'number', 'null'] };
      const right: UnknownSchema = { type: ['number', 'string'], nullable: true };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    // 복잡한 시나리오: nullable:true + null 중복
    test('should handle nullable:true with null already in array (redundant)', () => {
      const left: UnknownSchema = { type: ['string', 'null'], nullable: true };
      const right: UnknownSchema = { type: ['null', 'string'], nullable: true };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should handle different array orders with nullable:true', () => {
      const left: UnknownSchema = { type: ['null', 'string', 'number'], nullable: true };
      const right: UnknownSchema = { type: ['number', 'string', 'null'], nullable: true };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    // nullable:false vs 배열에 null 포함
    test('should return false for nullable:false vs array with null', () => {
      const left: UnknownSchema = { type: ['string'], nullable: false };
      const right: UnknownSchema = { type: ['string', 'null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });

    test('should return false for array with null vs nullable:false', () => {
      const left: UnknownSchema = { type: ['string', 'null'] };
      const right: UnknownSchema = { type: ['string'], nullable: false };
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });

    // 비동일: 한쪽만 nullable
    test('should return false when only one side is nullable via property', () => {
      const left: UnknownSchema = { type: ['string', 'number'], nullable: true };
      const right: UnknownSchema = { type: ['string', 'number'] };
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });

    test('should return false when only one side has null in array', () => {
      const left: UnknownSchema = { type: ['string', 'number', 'null'] };
      const right: UnknownSchema = { type: ['string', 'number'] };
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });
  });

  describe('array type with null vs nullable property comparison', () => {
    test('should compare type array with null vs nullable:true for string', () => {
      const arrayWithNull: UnknownSchema = { type: ['string', 'null'] };
      const nullableProperty: UnknownSchema = {
        type: 'string',
        nullable: true,
      };
      expect(isIdenticalSchemaType(arrayWithNull, nullableProperty)).toBe(true);
    });

    test('should compare type array with null vs nullable:true for number', () => {
      const arrayWithNull: UnknownSchema = { type: ['number', 'null'] };
      const nullableProperty: UnknownSchema = {
        type: 'number',
        nullable: true,
      };
      expect(isIdenticalSchemaType(arrayWithNull, nullableProperty)).toBe(true);
    });

    test('should compare type array with null vs nullable:true for object', () => {
      const arrayWithNull: UnknownSchema = { type: ['object', 'null'] };
      const nullableProperty: UnknownSchema = {
        type: 'object',
        nullable: true,
      };
      expect(isIdenticalSchemaType(arrayWithNull, nullableProperty)).toBe(true);
    });

    test('should compare type array with null vs nullable:true for array', () => {
      const arrayWithNull: UnknownSchema = { type: ['array', 'null'] };
      const nullableProperty: UnknownSchema = { type: 'array', nullable: true };
      expect(isIdenticalSchemaType(arrayWithNull, nullableProperty)).toBe(true);
    });

    test('should compare type array with null vs nullable:true for boolean', () => {
      const arrayWithNull: UnknownSchema = { type: ['boolean', 'null'] };
      const nullableProperty: UnknownSchema = {
        type: 'boolean',
        nullable: true,
      };
      expect(isIdenticalSchemaType(arrayWithNull, nullableProperty)).toBe(true);
    });

    test('should compare type array with null vs nullable:true for integer', () => {
      const arrayWithNull: UnknownSchema = { type: ['integer', 'null'] };
      const nullableProperty: UnknownSchema = {
        type: 'integer',
        nullable: true,
      };
      expect(isIdenticalSchemaType(arrayWithNull, nullableProperty)).toBe(true);
    });

    test('should compare reversed order: nullable:true vs type array with null', () => {
      const nullableProperty: UnknownSchema = {
        type: 'string',
        nullable: true,
      };
      const arrayWithNull: UnknownSchema = { type: ['string', 'null'] };
      expect(isIdenticalSchemaType(nullableProperty, arrayWithNull)).toBe(true);
    });

    test('should compare nullable:true with type array where null is first', () => {
      const nullableProperty: UnknownSchema = {
        type: 'string',
        nullable: true,
      };
      const arrayWithNull: UnknownSchema = { type: ['null', 'string'] };
      expect(isIdenticalSchemaType(nullableProperty, arrayWithNull)).toBe(true);
    });

    test('should return false when type array has null but types differ', () => {
      const arrayWithNull: UnknownSchema = { type: ['string', 'null'] };
      const nullableProperty: UnknownSchema = {
        type: 'number',
        nullable: true,
      };
      expect(isIdenticalSchemaType(arrayWithNull, nullableProperty)).toBe(
        false,
      );
    });

    test('should return false when one is nullable and other is not', () => {
      const arrayWithNull: UnknownSchema = { type: ['string', 'null'] };
      const nonNullable: UnknownSchema = { type: 'string', nullable: false };
      expect(isIdenticalSchemaType(arrayWithNull, nonNullable)).toBe(false);
    });

    test('should return false when type array has null but nullable:false explicitly', () => {
      const arrayWithNull: UnknownSchema = { type: ['string', 'null'] };
      const nullableFalse: UnknownSchema = { type: 'string' }; // nullable not specified = not nullable
      expect(isIdenticalSchemaType(arrayWithNull, nullableFalse)).toBe(false);
    });

    test('should handle nullable:true with complex schema properties', () => {
      const arrayWithNull: UnknownSchema = {
        type: ['string', 'null'],
        minLength: 1,
        maxLength: 100,
      };
      const nullableProperty: UnknownSchema = {
        type: 'string',
        nullable: true,
        format: 'email',
      };
      expect(isIdenticalSchemaType(arrayWithNull, nullableProperty)).toBe(true);
    });
  });
});
