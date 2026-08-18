import { describe, expect, test } from 'vitest';

import type { UnknownSchema } from '../../types/jsonSchema';
import { isIdenticalSchemaType } from '../isIdenticalSchemaType';

describe('isIdenticalSchemaType', () => {
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
      const left: UnknownSchema = {
        type: ['string', 'number', 'boolean', 'object', 'null'],
      };
      const right: UnknownSchema = {
        type: ['null', 'object', 'boolean', 'number', 'string'],
      };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should return false for 4+ types with one type difference', () => {
      const left: UnknownSchema = {
        type: ['string', 'number', 'boolean', 'object', 'null'],
      };
      const right: UnknownSchema = {
        type: ['string', 'number', 'boolean', 'array', 'null'],
      };
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });

    test('should return false for 4+ types vs 3 types (different count)', () => {
      const left: UnknownSchema = {
        type: ['string', 'number', 'boolean', 'null'],
      };
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
      const left: UnknownSchema = {
        type: ['string', 'number'],
        nullable: true,
      };
      const right: UnknownSchema = { type: ['string', 'number', 'null'] };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should return true for multi-type array with null vs nullable:true', () => {
      const left: UnknownSchema = { type: ['string', 'number', 'null'] };
      const right: UnknownSchema = {
        type: ['number', 'string'],
        nullable: true,
      };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    // 복잡한 시나리오: nullable:true + null 중복
    test('should handle nullable:true with null already in array (redundant)', () => {
      const left: UnknownSchema = { type: ['string', 'null'], nullable: true };
      const right: UnknownSchema = { type: ['null', 'string'], nullable: true };
      expect(isIdenticalSchemaType(left, right)).toBe(true);
    });

    test('should handle different array orders with nullable:true', () => {
      const left: UnknownSchema = {
        type: ['null', 'string', 'number'],
        nullable: true,
      };
      const right: UnknownSchema = {
        type: ['number', 'string', 'null'],
        nullable: true,
      };
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
      const left: UnknownSchema = {
        type: ['string', 'number'],
        nullable: true,
      };
      const right: UnknownSchema = { type: ['string', 'number'] };
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });

    test('should return false when only one side has null in array', () => {
      const left: UnknownSchema = { type: ['string', 'number', 'null'] };
      const right: UnknownSchema = { type: ['string', 'number'] };
      expect(isIdenticalSchemaType(left, right)).toBe(false);
    });
  });
});
