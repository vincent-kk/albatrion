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
});
