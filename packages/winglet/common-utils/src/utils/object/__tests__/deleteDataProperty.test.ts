import { describe, expect, it } from 'vitest';

import { deleteDataProperty } from '../deleteDataProperty';

describe('deleteDataProperty', () => {
  describe('reserved member names with own property', () => {
    it('should remove an own __proto__ data property and keep the prototype', () => {
      const target = JSON.parse('{"__proto__":{"x":1},"keep":1}');

      expect(deleteDataProperty(target, '__proto__')).toBe(true);
      expect(
        Object.getOwnPropertyDescriptor(target, '__proto__'),
      ).toBeUndefined();
      expect(Object.getPrototypeOf(target)).toBe(Object.prototype);
      expect(target.keep).toBe(1);
    });

    it('should remove an own constructor data property', () => {
      const target = JSON.parse('{"constructor":{"c":1}}');

      expect(deleteDataProperty(target, 'constructor')).toBe(true);
      expect(
        Object.getOwnPropertyDescriptor(target, 'constructor'),
      ).toBeUndefined();
    });

    it('should remove an own prototype data property', () => {
      const target = JSON.parse('{"prototype":{"p":1}}');

      expect(deleteDataProperty(target, 'prototype')).toBe(true);
      expect(
        Object.getOwnPropertyDescriptor(target, 'prototype'),
      ).toBeUndefined();
    });
  });

  describe('reserved member names without own property', () => {
    it('should not remove inherited members from the prototype chain', () => {
      const target = {};

      expect(deleteDataProperty(target, 'constructor')).toBe(true);
      expect(deleteDataProperty(target, '__proto__')).toBe(true);
      expect({}.constructor).toBe(Object);
      expect(Object.getPrototypeOf({})).toBe(Object.prototype);
    });
  });

  describe('ordinary keys', () => {
    it('should behave like the plain delete operator', () => {
      const target: Record<string, unknown> = { a: 1 };

      expect(deleteDataProperty(target, 'a')).toBe(true);
      expect(target.a).toBeUndefined();
      expect(deleteDataProperty(target, 'absent')).toBe(true);
    });
  });
});
