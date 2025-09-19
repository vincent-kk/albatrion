import { afterEach, describe, expect, it } from 'vitest';

import { isEmpty } from '../isEmpty';

describe('isEmpty', () => {
  afterEach(() => {
    // Clean up any prototype pollution from tests
    delete (Object.prototype as any).testProp;
    delete (Object.prototype as any).malicious;
    delete (Object.prototype as any).polluted;
  });

  describe('basic functionality', () => {
    it('should return true for null and undefined', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should return true for falsy primitives', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty(0)).toBe(true);
      expect(isEmpty(false)).toBe(true);
      expect(isEmpty(NaN)).toBe(true);
    });

    it('should return false for truthy primitives', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty(1)).toBe(false);
      expect(isEmpty(true)).toBe(false);
      expect(isEmpty('0')).toBe(false);
    });

    it('should return true for empty objects and arrays', () => {
      expect(isEmpty({})).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty(Object.create(null))).toBe(true);
    });

    it('should return false for non-empty objects and arrays', () => {
      expect(isEmpty({ a: 1 })).toBe(false);
      expect(isEmpty([1, 2, 3])).toBe(false);
      expect(isEmpty({ length: 0 })).toBe(false);
    });

    it('should return false for functions', () => {
      expect(isEmpty(() => {})).toBe(false);
      expect(isEmpty(function () {})).toBe(false);
    });
  });

  describe('prototype pollution protection', () => {
    it('should correctly handle empty objects when Object.prototype is polluted', () => {
      // Pollute Object.prototype
      (Object.prototype as any).malicious = 'attack';

      const emptyObj = {};

      // Should still return true for empty object despite prototype pollution
      expect(isEmpty(emptyObj)).toBe(true);

      // Should return false for object with own properties
      const objWithOwnProp = { own: 'property' };
      expect(isEmpty(objWithOwnProp)).toBe(false);
    });

    it('should ignore inherited properties from prototype chain', () => {
      // Add property to Object.prototype
      (Object.prototype as any).testProp = 'inherited';

      const obj1 = {};
      const obj2 = Object.create(null);
      const obj3 = { own: 'value' };

      // Empty objects should still be empty despite inherited properties
      expect(isEmpty(obj1)).toBe(true);
      expect(isEmpty(obj2)).toBe(true);

      // Objects with own properties should not be empty
      expect(isEmpty(obj3)).toBe(false);
    });

    it('should work correctly with multiple prototype pollutions', () => {
      // Multiple prototype pollutions
      (Object.prototype as any).polluted1 = 'value1';
      (Object.prototype as any).polluted2 = 'value2';
      (Object.prototype as any).polluted3 = 'value3';

      const emptyObj = {};
      const objWithProp = { real: 'property' };

      expect(isEmpty(emptyObj)).toBe(true);
      expect(isEmpty(objWithProp)).toBe(false);
    });

    it('should handle arrays correctly with prototype pollution', () => {
      // Pollute Array.prototype (which inherits from Object.prototype)
      (Array.prototype as any).customMethod = function () {
        return 'polluted';
      };

      const emptyArray: any[] = [];
      const nonEmptyArray = [1, 2, 3];

      expect(isEmpty(emptyArray)).toBe(true);
      expect(isEmpty(nonEmptyArray)).toBe(false);

      // Clean up Array prototype
      delete (Array.prototype as any).customMethod;
    });

    it('should handle objects created with Object.create correctly', () => {
      const proto = { inherited: 'property' };
      const child = Object.create(proto);

      // Object with only inherited properties should be empty
      expect(isEmpty(child)).toBe(true);

      // Add own property
      child.own = 'value';
      expect(isEmpty(child)).toBe(false);
    });
  });

  describe('edge cases with built-in objects', () => {
    it('should handle built-in objects correctly', () => {
      expect(isEmpty(new Date())).toBe(true); // No enumerable properties
      expect(isEmpty(new Error())).toBe(true); // No enumerable properties
      expect(isEmpty(new Map())).toBe(true); // No enumerable properties
      expect(isEmpty(new Set())).toBe(true); // No enumerable properties
      expect(isEmpty(new WeakMap())).toBe(true); // No enumerable properties
      expect(isEmpty(new WeakSet())).toBe(true); // No enumerable properties
    });

    it('should handle sparse arrays correctly', () => {
      const sparse = new Array(5); // [empty × 5]
      expect(isEmpty(sparse)).toBe(true);

      sparse[2] = 'value';
      expect(isEmpty(sparse)).toBe(false);
    });
  });
});
