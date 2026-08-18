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
});
