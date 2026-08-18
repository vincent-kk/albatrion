import { describe, expect, test } from 'vitest';

import type { UnknownSchema } from '../../types/jsonSchema';
import { isCompatibleSchemaType } from '../isCompatibleSchemaType';

describe('isCompatibleSchemaType', () => {
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
});
