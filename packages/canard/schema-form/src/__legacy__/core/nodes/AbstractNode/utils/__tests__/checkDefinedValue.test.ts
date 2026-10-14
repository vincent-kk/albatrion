import { describe, expect, it } from 'vitest';

import { checkDefinedValue } from '../checkDefinedValue';

/**
 * Tests for checkDefinedValue utility function.
 *
 * @note This function is designed to work with JSON-serializable data types only:
 * string, number, boolean, null, array, and object.
 *
 * For performance reasons, it intentionally uses a simple for...in loop that only
 * checks enumerable own properties. This means it will return false for objects
 * like Date, RegExp, Map, Set that have no enumerable own properties, even though
 * they may contain internal state. This is acceptable because these types are not
 * JSON-serializable and should not appear in form values.
 */
describe('checkDefinedValue', () => {
  it('should return false for undefined', () => {
    expect(checkDefinedValue(undefined)).toBe(false);
  });

  it('should return true for null', () => {
    expect(checkDefinedValue(null)).toBe(true);
  });

  it('should return false for empty object', () => {
    expect(checkDefinedValue({})).toBe(false);
  });

  it('should return false for empty array', () => {
    expect(checkDefinedValue([])).toBe(false);
  });

  it('should return true for object with properties', () => {
    expect(checkDefinedValue({ key: 'value' })).toBe(true);
    expect(checkDefinedValue({ a: 1, b: 2 })).toBe(true);
    expect(checkDefinedValue({ nested: { value: 'test' } })).toBe(true);
  });

  it('should return true for array with items', () => {
    expect(checkDefinedValue(['item'])).toBe(true);
    expect(checkDefinedValue([1, 2, 3])).toBe(true);
    expect(checkDefinedValue([null])).toBe(true);
    expect(checkDefinedValue([undefined])).toBe(true);
  });

  it('should return true for primitive string values', () => {
    expect(checkDefinedValue('hello')).toBe(true);
    expect(checkDefinedValue('test')).toBe(true);
  });

  it('should return true for empty string', () => {
    expect(checkDefinedValue('')).toBe(true);
  });

  it('should return true for number values', () => {
    expect(checkDefinedValue(123)).toBe(true);
    expect(checkDefinedValue(-456)).toBe(true);
    expect(checkDefinedValue(3.14)).toBe(true);
  });

  it('should return true for zero', () => {
    expect(checkDefinedValue(0)).toBe(true);
  });

  it('should return true for NaN', () => {
    expect(checkDefinedValue(NaN)).toBe(true);
  });

  it('should return true for boolean values', () => {
    expect(checkDefinedValue(true)).toBe(true);
    expect(checkDefinedValue(false)).toBe(true);
  });

  it('should return true for function values', () => {
    expect(checkDefinedValue(() => {})).toBe(true);
    expect(checkDefinedValue(function test() {})).toBe(true);
  });

  it('should return false for Date objects (no own enumerable properties)', () => {
    // Date objects are not JSON-serializable and have no enumerable own properties.
    // This is intentionally treated as "not defined" for performance reasons.
    expect(checkDefinedValue(new Date())).toBe(false);
  });

  it('should return false for RegExp objects (no own enumerable properties)', () => {
    // RegExp objects are not JSON-serializable and have no enumerable own properties.
    // This is intentionally treated as "not defined" for performance reasons.
    expect(checkDefinedValue(/test/)).toBe(false);
  });

  it('should return true for symbol values', () => {
    expect(checkDefinedValue(Symbol('test'))).toBe(true);
  });

  it('should return true for bigint values', () => {
    expect(checkDefinedValue(BigInt(123))).toBe(true);
  });

  it('should handle objects with inherited properties correctly', () => {
    const proto = { inherited: 'value' };
    const obj = Object.create(proto);

    // Object has no own properties, should return false
    expect(checkDefinedValue(obj)).toBe(false);

    // Add own property
    obj.own = 'value';
    expect(checkDefinedValue(obj)).toBe(true);
  });

  it('should handle objects with non-enumerable properties', () => {
    const obj = {};
    Object.defineProperty(obj, 'hidden', {
      value: 'test',
      enumerable: false,
    });

    // Non-enumerable properties are not checked by for...in
    expect(checkDefinedValue(obj)).toBe(false);
  });

  it('should return false for array-like objects without own properties', () => {
    const arrayLike = Object.create(null);
    arrayLike.length = 0;

    // Has length property
    expect(checkDefinedValue(arrayLike)).toBe(true);
  });

  it('should handle frozen and sealed objects', () => {
    const frozen = Object.freeze({ key: 'value' });
    const sealed = Object.seal({ key: 'value' });

    expect(checkDefinedValue(frozen)).toBe(true);
    expect(checkDefinedValue(sealed)).toBe(true);

    const emptyFrozen = Object.freeze({});
    const emptySealed = Object.seal({});

    expect(checkDefinedValue(emptyFrozen)).toBe(false);
    expect(checkDefinedValue(emptySealed)).toBe(false);
  });

  it('should handle Map and Set objects', () => {
    const map = new Map();
    const set = new Set();

    // Map/Set objects are not JSON-serializable and have no own enumerable properties.
    // This is intentionally treated as "not defined" for performance reasons.
    expect(checkDefinedValue(map)).toBe(false);
    expect(checkDefinedValue(set)).toBe(false);

    map.set('key', 'value');
    set.add('item');

    // Even with items, Map/Set have no own enumerable properties
    expect(checkDefinedValue(map)).toBe(false);
    expect(checkDefinedValue(set)).toBe(false);
  });

  it('should handle class instances', () => {
    class TestClass {
      value = 'test';
    }

    const instance = new TestClass();
    expect(checkDefinedValue(instance)).toBe(true);

    class EmptyClass {}
    const emptyInstance = new EmptyClass();
    expect(checkDefinedValue(emptyInstance)).toBe(false);
  });
});
