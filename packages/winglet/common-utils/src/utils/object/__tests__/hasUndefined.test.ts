// packages/winglet/common-utils/src/utils/object/__tests__/hasUndefined.test.ts
import { describe, expect, it } from 'vitest';

import { hasUndefined } from '../hasUndefined';

describe('hasUndefined', () => {
  // 1. Primitive and Direct Values
  it('should return true for undefined itself', () => {
    expect(hasUndefined(undefined)).toBe(true);
  });

  it('should return false for null', () => {
    expect(hasUndefined(null)).toBe(false);
  });

  it('should return false for primitive types (string, number, boolean)', () => {
    expect(hasUndefined('hello')).toBe(false);
    expect(hasUndefined(123)).toBe(false);
    expect(hasUndefined(0)).toBe(false);
    expect(hasUndefined(true)).toBe(false);
    expect(hasUndefined(false)).toBe(false);
    expect(hasUndefined('')).toBe(false);
  });

  // 2. Simple Objects
  it('should return true if an object has an undefined value', () => {
    const obj = { a: 1, b: undefined, c: 'hello' };
    expect(hasUndefined(obj)).toBe(true);
  });

  it('should return false if an object has no undefined values', () => {
    const obj = { a: 1, b: null, c: 'hello', d: 0 };
    expect(hasUndefined(obj)).toBe(false);
  });

  it('should return false for an empty object', () => {
    const obj = {};
    expect(hasUndefined(obj)).toBe(false);
  });

  // 3. Simple Arrays
  it('should return true if an array contains undefined', () => {
    const arr = [1, 'hello', undefined, true];
    expect(hasUndefined(arr)).toBe(true);
  });

  it('should return false if an array does not contain undefined', () => {
    const arr = [1, 'hello', null, true, 0];
    expect(hasUndefined(arr)).toBe(false);
  });

  it('should return false for an empty array', () => {
    const arr: unknown[] = [];
    expect(hasUndefined(arr)).toBe(false);
  });

  // 4. Nested Structures
  it('should return true for nested objects containing undefined', () => {
    const obj = { a: 1, b: { c: 'hello', d: undefined } };
    expect(hasUndefined(obj)).toBe(true);
  });

  it('should return false for nested objects without undefined', () => {
    const obj = { a: 1, b: { c: 'hello', d: null } };
    expect(hasUndefined(obj)).toBe(false);
  });

  it('should return true for nested arrays containing undefined', () => {
    const arr = [1, ['hello', undefined], true];
    expect(hasUndefined(arr)).toBe(true);
  });

  it('should return false for nested arrays without undefined', () => {
    const arr = [1, ['hello', null], true];
    expect(hasUndefined(arr)).toBe(false);
  });

  it('should return true for objects containing arrays with undefined', () => {
    const obj = { a: 1, b: [1, 2, undefined] };
    expect(hasUndefined(obj)).toBe(true);
  });

  it('should return false for objects containing arrays without undefined', () => {
    const obj = { a: 1, b: [1, 2, null] };
    expect(hasUndefined(obj)).toBe(false);
  });

  it('should return true for arrays containing objects with undefined', () => {
    const arr = [1, { a: 'hello', b: undefined }, true];
    expect(hasUndefined(arr)).toBe(true);
  });

  it('should return false for arrays containing objects without undefined', () => {
    const arr = [1, { a: 'hello', b: null }, true];
    expect(hasUndefined(arr)).toBe(false);
  });

  // 5. Complex Mixed Structures
  it('should return true for deeply nested complex structures with undefined', () => {
    const complex = {
      a: [1, { b: 'hello', c: [true, null, { d: undefined }] }],
      e: 5,
    };
    expect(hasUndefined(complex)).toBe(true);
  });

  it('should return false for deeply nested complex structures without undefined', () => {
    const complex = {
      a: [1, { b: 'hello', c: [true, null, { d: 'value' }] }],
      e: 5,
      f: null,
    };
    expect(hasUndefined(complex)).toBe(false);
  });

  // 6. Edge Cases with Object Prototype
  it('should handle objects created with null prototype', () => {
    const objWithNullProto = Object.create(null);
    objWithNullProto.a = 1;
    objWithNullProto.b = undefined;
    expect(hasUndefined(objWithNullProto)).toBe(true);

    const objWithNullProtoNoUndefined = Object.create(null);
    objWithNullProtoNoUndefined.a = 1;
    objWithNullProtoNoUndefined.b = null;
    expect(hasUndefined(objWithNullProtoNoUndefined)).toBe(false);
  });
});
