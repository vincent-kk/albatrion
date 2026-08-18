import { describe, expect, test } from 'vitest';

import type { UnknownSchema } from '../../types/jsonSchema';
import { isCompatibleSchemaType } from '../isCompatibleSchemaType';

describe('isCompatibleSchemaType', () => {
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
});
