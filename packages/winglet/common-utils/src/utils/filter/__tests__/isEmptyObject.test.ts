import { afterEach, describe, expect, it } from 'vitest';

import { isEmptyObject } from '../isEmptyObject';

describe('isEmptyObject', () => {
  afterEach(() => {
    // Clean up any prototype pollution from tests
    delete (Object.prototype as any).testProp;
    delete (Object.prototype as any).malicious;
    delete (Object.prototype as any).polluted;
  });

  it('should return true if the input is an empty object', () => {
    expect(isEmptyObject({})).toBe(true);
    expect(isEmptyObject([])).toBe(true);
  });
  it('should return false if the input is not an empty object', () => {
    expect(isEmptyObject({ a: 1 })).toBe(false);
  });
  it('should return false if the input is not an object', () => {
    expect(isEmptyObject(1)).toBe(false);
    expect(isEmptyObject('')).toBe(false);
    expect(isEmptyObject(Symbol())).toBe(false);
  });
  it('this is error case, but it will not be fixed(because of performance)', () => {
    expect(isEmptyObject(new Date())).toBe(true);
    expect(isEmptyObject(new Error())).toBe(true);
    expect(isEmptyObject(new Map())).toBe(true);
    expect(isEmptyObject(new Set())).toBe(true);
    expect(isEmptyObject(new WeakMap())).toBe(true);
    expect(isEmptyObject(new WeakSet())).toBe(true);
    expect(isEmptyObject(new Promise(() => {}))).toBe(true);
  });

  describe('prototype pollution protection', () => {
    it('should correctly handle empty objects when Object.prototype is polluted', () => {
      // Pollute Object.prototype
      (Object.prototype as any).malicious = 'attack';

      const emptyObj = {};
      const emptyArray: any[] = [];

      // Should still return true for empty objects despite prototype pollution
      expect(isEmptyObject(emptyObj)).toBe(true);
      expect(isEmptyObject(emptyArray)).toBe(true);

      // Should return false for object with own properties
      const objWithOwnProp = { own: 'property' };
      expect(isEmptyObject(objWithOwnProp)).toBe(false);
    });

    it('should ignore inherited properties from prototype chain', () => {
      // Add property to Object.prototype
      (Object.prototype as any).testProp = 'inherited';

      const obj1 = {};
      const obj2 = Object.create(null);
      const obj3 = { own: 'value' };

      // Empty objects should still be empty despite inherited properties
      expect(isEmptyObject(obj1)).toBe(true);
      expect(isEmptyObject(obj2)).toBe(true);

      // Objects with own properties should not be empty
      expect(isEmptyObject(obj3)).toBe(false);
    });

    it('should work correctly with multiple prototype pollutions', () => {
      // Multiple prototype pollutions
      (Object.prototype as any).polluted1 = 'value1';
      (Object.prototype as any).polluted2 = 'value2';
      (Object.prototype as any).polluted3 = 'value3';

      const emptyObj = {};
      const objWithProp = { real: 'property' };

      expect(isEmptyObject(emptyObj)).toBe(true);
      expect(isEmptyObject(objWithProp)).toBe(false);
    });
  });
});
