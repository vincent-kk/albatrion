import { describe, expect, it } from 'vitest';

import { getDataProperty } from '../getDataProperty';

describe('getDataProperty', () => {
  describe('reserved member names with own data property', () => {
    it('should return own __proto__ data instead of the prototype', () => {
      const target = JSON.parse('{"__proto__":{"x":1},"keep":1}');

      expect(getDataProperty(target, '__proto__')).toEqual({ x: 1 });
      expect(getDataProperty(target, '__proto__')).not.toBe(
        Object.getPrototypeOf(target),
      );
    });

    it('should return own constructor data instead of the inherited constructor', () => {
      const target = JSON.parse('{"constructor":{"c":1}}');

      expect(getDataProperty(target, 'constructor')).toEqual({ c: 1 });
    });

    it('should return own prototype data', () => {
      const target = JSON.parse('{"prototype":{"p":1}}');

      expect(getDataProperty(target, 'prototype')).toEqual({ p: 1 });
    });
  });

  describe('reserved member names without own property', () => {
    it('should not walk the prototype chain for __proto__', () => {
      expect(getDataProperty({}, '__proto__')).toBeUndefined();
    });

    it('should not walk the prototype chain for constructor', () => {
      expect(getDataProperty({}, 'constructor')).toBeUndefined();
    });

    it('should not walk the prototype chain for prototype', () => {
      expect(getDataProperty({}, 'prototype')).toBeUndefined();
    });
  });

  describe('ordinary keys', () => {
    it('should behave like plain property access', () => {
      const target = { a: 1 };

      expect(getDataProperty(target, 'a')).toBe(1);
      expect(getDataProperty(target, 'absent')).toBeUndefined();
    });

    it('should keep prototype chain lookup for ordinary keys', () => {
      const target = Object.create({ inherited: 1 });

      expect(getDataProperty(target, 'inherited')).toBe(1);
    });
  });

  describe('array access', () => {
    it('should not interfere with array index access', () => {
      const target = [10, 20];

      expect(getDataProperty(target, '0')).toBe(10);
      expect(getDataProperty(target, 'length')).toBe(2);
    });
  });
});
