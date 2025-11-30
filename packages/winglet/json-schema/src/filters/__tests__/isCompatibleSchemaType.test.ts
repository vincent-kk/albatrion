import { describe, expect, test } from 'vitest';

import type { UnknownSchema } from '../../types/jsonSchema';
import { isCompatibleSchemaType } from '../isCompatibleSchemaType';

describe('isCompatibleSchemaType', () => {
  // 기본 케이스 - 동일한 단일 타입
  describe('same single types', () => {
    test('should return true for same single type', () => {
      const left: UnknownSchema = { type: 'string' };
      const right: UnknownSchema = { type: 'string' };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for same object types', () => {
      const left: UnknownSchema = { type: 'object' };
      const right: UnknownSchema = { type: 'object' };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for same array types', () => {
      const left: UnknownSchema = { type: 'array' };
      const right: UnknownSchema = { type: 'array' };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for same boolean types', () => {
      const left: UnknownSchema = { type: 'boolean' };
      const right: UnknownSchema = { type: 'boolean' };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for same null types', () => {
      const left: UnknownSchema = { type: 'null' };
      const right: UnknownSchema = { type: 'null' };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });
  });

  // number/integer 호환성 테스트
  describe('number/integer compatibility', () => {
    test('should return true for number and integer single types', () => {
      const left: UnknownSchema = { type: 'number' };
      const right: UnknownSchema = { type: 'integer' };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for integer and number single types', () => {
      const left: UnknownSchema = { type: 'integer' };
      const right: UnknownSchema = { type: 'number' };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for same number types', () => {
      const left: UnknownSchema = { type: 'number' };
      const right: UnknownSchema = { type: 'number' };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for same integer types', () => {
      const left: UnknownSchema = { type: 'integer' };
      const right: UnknownSchema = { type: 'integer' };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for nullable number and nullable integer', () => {
      const left: UnknownSchema = { type: ['number', 'null'] };
      const right: UnknownSchema = { type: ['integer', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for nullable integer and nullable number (reversed order)', () => {
      const left: UnknownSchema = { type: ['null', 'integer'] };
      const right: UnknownSchema = { type: ['number', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for [number] and integer', () => {
      const left: UnknownSchema = { type: ['number'] };
      const right: UnknownSchema = { type: 'integer' };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for [integer, null] and number', () => {
      const left: UnknownSchema = { type: ['integer', 'null'] };
      const right: UnknownSchema = { type: 'number' };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });
  });

  // 다른 단일 타입
  describe('different single types', () => {
    test('should return false for string vs number', () => {
      const left: UnknownSchema = { type: 'string' };
      const right: UnknownSchema = { type: 'number' };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should return false for string vs object', () => {
      const left: UnknownSchema = { type: 'string' };
      const right: UnknownSchema = { type: 'object' };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should return false for number vs array', () => {
      const left: UnknownSchema = { type: 'number' };
      const right: UnknownSchema = { type: 'array' };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });
  });

  // undefined 케이스
  describe('undefined types', () => {
    test('should return false when left type is undefined', () => {
      const left: UnknownSchema = {};
      const right: UnknownSchema = { type: 'string' };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should return false when right type is undefined', () => {
      const left: UnknownSchema = { type: 'string' };
      const right: UnknownSchema = {};
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should return false when both types are undefined', () => {
      const left: UnknownSchema = {};
      const right: UnknownSchema = {};
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });
  });

  // nullable 호환성 - [...types, 'null'] ~= [...types]
  describe('nullable compatibility', () => {
    test('should return true for [string] and [string, null]', () => {
      const left: UnknownSchema = { type: ['string'] };
      const right: UnknownSchema = { type: ['string', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for [string, null] and [string]', () => {
      const left: UnknownSchema = { type: ['string', 'null'] };
      const right: UnknownSchema = { type: ['string'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for [null, string] and [string]', () => {
      const left: UnknownSchema = { type: ['null', 'string'] };
      const right: UnknownSchema = { type: ['string'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for string and [string, null]', () => {
      const left: UnknownSchema = { type: 'string' };
      const right: UnknownSchema = { type: ['string', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for [string, null] and string', () => {
      const left: UnknownSchema = { type: ['string', 'null'] };
      const right: UnknownSchema = { type: 'string' };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for [null, string] and string', () => {
      const left: UnknownSchema = { type: ['null', 'string'] };
      const right: UnknownSchema = { type: 'string' };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for object and [object, null]', () => {
      const left: UnknownSchema = { type: 'object' };
      const right: UnknownSchema = { type: ['object', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for array and [array, null]', () => {
      const left: UnknownSchema = { type: 'array' };
      const right: UnknownSchema = { type: ['array', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for boolean and [boolean, null]', () => {
      const left: UnknownSchema = { type: 'boolean' };
      const right: UnknownSchema = { type: ['boolean', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for [string, number] and [string, number, null]', () => {
      const left: UnknownSchema = { type: ['string', 'number'] };
      const right: UnknownSchema = { type: ['string', 'number', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for [string, number, null] and [number, string]', () => {
      const left: UnknownSchema = { type: ['string', 'number', 'null'] };
      const right: UnknownSchema = { type: ['number', 'string'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });
  });

  // [type] === type 호환성
  describe('single element array equivalence', () => {
    test('should return true for [string] and string', () => {
      const left: UnknownSchema = { type: ['string'] };
      const right: UnknownSchema = { type: 'string' };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for string and [string]', () => {
      const left: UnknownSchema = { type: 'string' };
      const right: UnknownSchema = { type: ['string'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for [number] and number', () => {
      const left: UnknownSchema = { type: ['number'] };
      const right: UnknownSchema = { type: 'number' };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for [object] and object', () => {
      const left: UnknownSchema = { type: ['object'] };
      const right: UnknownSchema = { type: 'object' };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });
  });

  // 배열 타입 동일성
  describe('array type equality', () => {
    test('should return true for same array types in same order', () => {
      const left: UnknownSchema = { type: ['string', 'number'] };
      const right: UnknownSchema = { type: ['string', 'number'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for same array types in different order', () => {
      const left: UnknownSchema = { type: ['string', 'number'] };
      const right: UnknownSchema = { type: ['number', 'string'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for [string, null] and [null, string]', () => {
      const left: UnknownSchema = { type: ['string', 'null'] };
      const right: UnknownSchema = { type: ['null', 'string'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for complex array types with null in different order', () => {
      const left: UnknownSchema = { type: ['string', 'number', 'null'] };
      const right: UnknownSchema = { type: ['null', 'number', 'string'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });
  });

  // 비호환 케이스
  describe('incompatible types', () => {
    test('should return false for different base types', () => {
      const left: UnknownSchema = { type: ['string', 'null'] };
      const right: UnknownSchema = { type: ['number', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should return false for [string, number] vs [string, boolean]', () => {
      const left: UnknownSchema = { type: ['string', 'number'] };
      const right: UnknownSchema = { type: ['string', 'boolean'] };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should return false for string vs [string, number]', () => {
      const left: UnknownSchema = { type: 'string' };
      const right: UnknownSchema = { type: ['string', 'number'] };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should return false for [string, number] vs string', () => {
      const left: UnknownSchema = { type: ['string', 'number'] };
      const right: UnknownSchema = { type: 'string' };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should return false for different number of non-null types', () => {
      const left: UnknownSchema = { type: ['string', 'number', 'boolean'] };
      const right: UnknownSchema = { type: ['string', 'number'] };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });
  });

  // null 단일 타입 vs 배열
  describe('null single type vs array', () => {
    test('should return false for null single vs nullable array with other type', () => {
      const left: UnknownSchema = { type: 'null' };
      const right: UnknownSchema = { type: ['string', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should return false for nullable array vs null single', () => {
      const left: UnknownSchema = { type: ['string', 'null'] };
      const right: UnknownSchema = { type: 'null' };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should return true for null single vs [null]', () => {
      const left: UnknownSchema = { type: 'null' };
      const right: UnknownSchema = { type: ['null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for [null] vs null single', () => {
      const left: UnknownSchema = { type: ['null'] };
      const right: UnknownSchema = { type: 'null' };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });
  });

  // 3개 이상 타입 배열 vs 단일 타입
  describe('multi-type array vs single type', () => {
    test('should return false for 3+ type array vs single type', () => {
      const left: UnknownSchema = { type: ['string', 'number', 'boolean'] };
      const right: UnknownSchema = { type: 'string' };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should return false for single type vs 3+ type array', () => {
      const left: UnknownSchema = { type: 'string' };
      const right: UnknownSchema = { type: ['string', 'number', 'boolean'] };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should return false for 3+ type nullable array vs single type', () => {
      const left: UnknownSchema = { type: ['string', 'number', 'null'] };
      const right: UnknownSchema = { type: 'string' };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should return false for single type vs 3+ type nullable array', () => {
      const left: UnknownSchema = { type: 'string' };
      const right: UnknownSchema = { type: ['string', 'number', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });
  });

  // 빈 배열
  describe('empty arrays', () => {
    test('should return false for empty array vs empty array', () => {
      const left: UnknownSchema = { type: [] };
      const right: UnknownSchema = { type: [] };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should return false for empty array vs non-empty', () => {
      const left: UnknownSchema = { type: [] };
      const right: UnknownSchema = { type: ['string'] };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should return false for [null] vs []', () => {
      const left: UnknownSchema = { type: ['null'] };
      const right: UnknownSchema = { type: [] };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should return true for [null] vs [null]', () => {
      const left: UnknownSchema = { type: ['null'] };
      const right: UnknownSchema = { type: ['null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });
  });

  // 복합 케이스
  describe('complex scenarios', () => {
    test('should handle number/integer with nullable compatibility', () => {
      const left: UnknownSchema = { type: 'integer' };
      const right: UnknownSchema = { type: ['number', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should handle number/integer with multi-type arrays', () => {
      const left: UnknownSchema = { type: ['string', 'number'] };
      const right: UnknownSchema = { type: ['string', 'integer', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should handle integer/number in different positions', () => {
      const left: UnknownSchema = { type: ['integer', 'string', 'null'] };
      const right: UnknownSchema = { type: ['string', 'number'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should ignore other schema properties', () => {
      const left: UnknownSchema = {
        type: 'string',
        format: 'email',
        minLength: 1,
      };
      const right: UnknownSchema = { type: ['string', 'null'], maxLength: 100 };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });
  });

  // 실제 JSON Schema 예시
  describe('real-world schemas', () => {
    test('should work with real-world nullable string schemas', () => {
      const left: UnknownSchema = {
        type: 'string',
        description: 'User email',
      };
      const right: UnknownSchema = {
        type: ['string', 'null'],
        format: 'email',
      };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should work with real-world nullable number schemas', () => {
      const left: UnknownSchema = {
        type: 'integer',
        minimum: 0,
        maximum: 100,
      };
      const right: UnknownSchema = {
        type: ['number', 'null'],
        description: 'Age',
      };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return false for incompatible real-world schemas', () => {
      const left: UnknownSchema = {
        type: 'object',
        properties: { name: { type: 'string' } },
      };
      const right: UnknownSchema = {
        type: ['array', 'null'],
        items: { type: 'string' },
      };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });
  });

  // nullable과 null이 섞인 배열-배열 케이스
  describe('nullable and null mixed array-array cases', () => {
    // 기본: 양쪽 모두 nullable 배열
    test('should return true for both nullable arrays with same base types', () => {
      const left: UnknownSchema = { type: ['string', 'null'] };
      const right: UnknownSchema = { type: ['string', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for nullable arrays with null in different positions', () => {
      const left: UnknownSchema = { type: ['null', 'string'] };
      const right: UnknownSchema = { type: ['string', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    // 다중 타입 + nullable
    test('should return true for multi-type nullable arrays with same types', () => {
      const left: UnknownSchema = { type: ['string', 'number', 'null'] };
      const right: UnknownSchema = { type: ['number', 'string', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for multi-type nullable arrays with null in different positions', () => {
      const left: UnknownSchema = { type: ['null', 'string', 'number'] };
      const right: UnknownSchema = { type: ['string', 'null', 'number'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    // nullable vs non-nullable 배열
    test('should return true for nullable vs non-nullable array with same base types', () => {
      const left: UnknownSchema = { type: ['string', 'number', 'null'] };
      const right: UnknownSchema = { type: ['string', 'number'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for non-nullable vs nullable array', () => {
      const left: UnknownSchema = { type: ['string', 'number'] };
      const right: UnknownSchema = { type: ['number', 'string', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    // integer/number 호환성 + nullable
    test('should return true for integer/number compatibility in nullable arrays', () => {
      const left: UnknownSchema = { type: ['integer', 'string', 'null'] };
      const right: UnknownSchema = { type: ['number', 'string', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for integer/number in nullable vs non-nullable', () => {
      const left: UnknownSchema = { type: ['integer', 'null'] };
      const right: UnknownSchema = { type: ['number'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for number vs nullable integer array', () => {
      const left: UnknownSchema = { type: ['number'] };
      const right: UnknownSchema = { type: ['null', 'integer'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    // 복잡한 다중 타입 조합
    test('should return true for complex multi-type arrays with nullable difference', () => {
      const left: UnknownSchema = { type: ['string', 'number', 'boolean'] };
      const right: UnknownSchema = {
        type: ['boolean', 'string', 'number', 'null'],
      };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for complex arrays with integer/number swap and nullable', () => {
      const left: UnknownSchema = {
        type: ['string', 'integer', 'boolean', 'null'],
      };
      const right: UnknownSchema = { type: ['boolean', 'number', 'string'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    // null-only 배열 vs nullable 배열
    test('should return false for [null] vs nullable array with other type', () => {
      const left: UnknownSchema = { type: ['null'] };
      const right: UnknownSchema = { type: ['string', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should return false for nullable array vs [null]', () => {
      const left: UnknownSchema = { type: ['string', 'null'] };
      const right: UnknownSchema = { type: ['null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    // 비호환 케이스
    test('should return false for different base types in nullable arrays', () => {
      const left: UnknownSchema = { type: ['string', 'null'] };
      const right: UnknownSchema = { type: ['number', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should return false for partially matching multi-type nullable arrays', () => {
      const left: UnknownSchema = { type: ['string', 'number', 'null'] };
      const right: UnknownSchema = { type: ['string', 'boolean', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should return false for different count of base types ignoring null', () => {
      const left: UnknownSchema = { type: ['string', 'null'] };
      const right: UnknownSchema = { type: ['string', 'number', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    // object, array 타입과 nullable
    test('should return true for nullable object arrays', () => {
      const left: UnknownSchema = { type: ['object', 'null'] };
      const right: UnknownSchema = { type: ['null', 'object'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for nullable array type arrays', () => {
      const left: UnknownSchema = { type: ['array', 'null'] };
      const right: UnknownSchema = { type: ['array'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return false for object vs array in nullable context', () => {
      const left: UnknownSchema = { type: ['object', 'null'] };
      const right: UnknownSchema = { type: ['array', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    // 4개 이상의 타입
    test('should handle 4+ types with nullable', () => {
      const left: UnknownSchema = {
        type: ['string', 'number', 'boolean', 'object', 'null'],
      };
      const right: UnknownSchema = {
        type: ['object', 'boolean', 'number', 'string'],
      };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return false for 4+ types with one mismatch', () => {
      const left: UnknownSchema = {
        type: ['string', 'number', 'boolean', 'object', 'null'],
      };
      const right: UnknownSchema = {
        type: ['string', 'number', 'boolean', 'array'],
      };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    // null만 다른 위치에 있는 동일 배열
    test('should return true for same types with null at beginning vs end', () => {
      const left: UnknownSchema = { type: ['null', 'string', 'number'] };
      const right: UnknownSchema = { type: ['string', 'number', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for same types with null in middle vs end', () => {
      const left: UnknownSchema = { type: ['string', 'null', 'number'] };
      const right: UnknownSchema = { type: ['string', 'number', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });
  });

  // nullable 속성 호환성
  describe('nullable property compatibility', () => {
    test('should return true for type:[string,null] vs type:string + nullable:true', () => {
      const left: UnknownSchema = { type: ['string', 'null'] };
      const right: UnknownSchema = { type: 'string', nullable: true };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for type:string + nullable:true vs type:[string,null]', () => {
      const left: UnknownSchema = { type: 'string', nullable: true };
      const right: UnknownSchema = { type: ['string', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for type:string vs type:string + nullable:true', () => {
      const left: UnknownSchema = { type: 'string' };
      const right: UnknownSchema = { type: 'string', nullable: true };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for type:string + nullable:true vs type:string', () => {
      const left: UnknownSchema = { type: 'string', nullable: true };
      const right: UnknownSchema = { type: 'string' };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for type:[string] vs type:string + nullable:true', () => {
      const left: UnknownSchema = { type: ['string'] };
      const right: UnknownSchema = { type: 'string', nullable: true };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for type:number + nullable:true vs type:[integer,null]', () => {
      const left: UnknownSchema = { type: 'number', nullable: true };
      const right: UnknownSchema = { type: ['integer', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for type:integer + nullable:true vs type:number + nullable:true', () => {
      const left: UnknownSchema = { type: 'integer', nullable: true };
      const right: UnknownSchema = { type: 'number', nullable: true };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return false for different base types with nullable', () => {
      const left: UnknownSchema = { type: 'string', nullable: true };
      const right: UnknownSchema = { type: 'number', nullable: true };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should return false for type:[string,number] vs type:string + nullable:true', () => {
      const left: UnknownSchema = { type: ['string', 'number'] };
      const right: UnknownSchema = { type: 'string', nullable: true };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should handle nullable:false as non-nullable', () => {
      const left: UnknownSchema = { type: 'string', nullable: false };
      const right: UnknownSchema = { type: ['string', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should handle real-world OpenAPI nullable schema', () => {
      const openApiStyle: UnknownSchema = {
        type: 'string',
        nullable: true,
        description: 'Optional user name',
      };
      const jsonSchemaStyle: UnknownSchema = {
        type: ['string', 'null'],
        description: 'User name or null',
      };
      expect(isCompatibleSchemaType(openApiStyle, jsonSchemaStyle)).toBe(true);
    });
  });
});
