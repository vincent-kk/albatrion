import { describe, expect, it, afterEach } from 'vitest';

import { isEmptyPlainObject } from '../isEmptyPlainObject';

describe('isEmptyPlainObject', () => {
  afterEach(() => {
    // Clean up any prototype pollution from tests
    delete (Object.prototype as any).testProp;
    delete (Object.prototype as any).malicious;
    delete (Object.prototype as any).polluted;
  });

  it('should return true if the input is an empty object', () => {
    expect(isEmptyPlainObject({})).toBe(true);
  });
  it('should return false if the input is not an empty object', () => {
    expect(isEmptyPlainObject({ a: 1 })).toBe(false);
  });
  it('should return false if the input is not an object', () => {
    expect(isEmptyPlainObject(1)).toBe(false);
    expect(isEmptyPlainObject('')).toBe(false);
    expect(isEmptyPlainObject([])).toBe(false);
    expect(isEmptyPlainObject(new Date())).toBe(false);
  });
  it('this is safe version of isEmptyObject, but little bit slower', () => {
    expect(isEmptyPlainObject(new Date())).toBe(false);
    expect(isEmptyPlainObject(new Error())).toBe(false);
    expect(isEmptyPlainObject(new Map())).toBe(false);
    expect(isEmptyPlainObject(new Set())).toBe(false);
    expect(isEmptyPlainObject(new WeakMap())).toBe(false);
    expect(isEmptyPlainObject(new WeakSet())).toBe(false);
    expect(isEmptyPlainObject(new Promise(() => {}))).toBe(false);
  });

  describe('prototype pollution protection', () => {
    it('should correctly handle empty plain objects when Object.prototype is polluted', () => {
      // Pollute Object.prototype
      (Object.prototype as any).malicious = 'attack';

      const emptyObj = {};

      // Should still return true for empty plain objects despite prototype pollution
      expect(isEmptyPlainObject(emptyObj)).toBe(true);

      // Should return false for object with own properties
      const objWithOwnProp = { own: 'property' };
      expect(isEmptyPlainObject(objWithOwnProp)).toBe(false);

      // Should return false for non-plain objects (arrays, built-ins)
      expect(isEmptyPlainObject([])).toBe(false);
      expect(isEmptyPlainObject(new Date())).toBe(false);
    });

    it('should ignore inherited properties from prototype chain', () => {
      // Add property to Object.prototype
      (Object.prototype as any).testProp = 'inherited';

      const obj1 = {};
      const obj2 = Object.create(null);
      const obj3 = { own: 'value' };

      // Empty plain objects should still be empty despite inherited properties
      expect(isEmptyPlainObject(obj1)).toBe(true);
      expect(isEmptyPlainObject(obj2)).toBe(true);

      // Objects with own properties should not be empty
      expect(isEmptyPlainObject(obj3)).toBe(false);
    });

    it('should work correctly with multiple prototype pollutions', () => {
      // Multiple prototype pollutions
      (Object.prototype as any).polluted1 = 'value1';
      (Object.prototype as any).polluted2 = 'value2';
      (Object.prototype as any).polluted3 = 'value3';

      const emptyObj = {};
      const objWithProp = { real: 'property' };

      expect(isEmptyPlainObject(emptyObj)).toBe(true);
      expect(isEmptyPlainObject(objWithProp)).toBe(false);
    });

    it('should handle objects created with Object.create correctly', () => {
      const proto = { inherited: 'property' };
      const child = Object.create(proto);

      // Object.create(proto) creates object with prototype, not plain object
      expect(isEmptyPlainObject(child)).toBe(false);

      // Object.create(null) creates plain object
      const plainChild = Object.create(null);
      expect(isEmptyPlainObject(plainChild)).toBe(true);

      // Add own property to plain object
      plainChild.own = 'value';
      expect(isEmptyPlainObject(plainChild)).toBe(false);
    });
  });
});
