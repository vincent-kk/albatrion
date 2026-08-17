import { afterEach, describe, expect, it } from 'vitest';

import { setDataProperty } from '../setDataProperty';

describe('setDataProperty', () => {
  afterEach(() => {
    delete (Object.prototype as Record<string, unknown>).x;
  });

  describe('reserved member names without own property', () => {
    it('should create an own __proto__ data property without touching the prototype', () => {
      const target: Record<string, unknown> = { keep: 1 };
      setDataProperty(target, '__proto__', { x: 1 });

      const descriptor = Object.getOwnPropertyDescriptor(target, '__proto__');
      expect(descriptor?.value).toEqual({ x: 1 });
      expect(descriptor?.enumerable).toBe(true);
      expect(descriptor?.writable).toBe(true);
      expect(descriptor?.configurable).toBe(true);
      expect(Object.getPrototypeOf(target)).toBe(Object.prototype);
      expect(({} as Record<string, unknown>).x).toBeUndefined();
    });

    it('should create an own constructor data property', () => {
      const target: Record<string, unknown> = {};
      setDataProperty(target, 'constructor', { c: 1 });

      expect(
        Object.getOwnPropertyDescriptor(target, 'constructor')?.value,
      ).toEqual({ c: 1 });
      expect({}.constructor).toBe(Object);
    });

    it('should create an own prototype data property', () => {
      const target: Record<string, unknown> = {};
      setDataProperty(target, 'prototype', { p: 1 });

      expect(
        Object.getOwnPropertyDescriptor(target, 'prototype')?.value,
      ).toEqual({ p: 1 });
      expect(Object.getPrototypeOf(target)).toBe(Object.prototype);
    });
  });

  describe('reserved member names with existing own property', () => {
    it('should overwrite an own __proto__ data property in place', () => {
      const target = JSON.parse('{"__proto__":{"x":1}}');
      setDataProperty(target, '__proto__', { x: 2 });

      expect(
        Object.getOwnPropertyDescriptor(target, '__proto__')?.value,
      ).toEqual({ x: 2 });
      expect(Object.getPrototypeOf(target)).toBe(Object.prototype);
    });

    it('should overwrite an own constructor data property in place', () => {
      const target = JSON.parse('{"constructor":1}');
      setDataProperty(target, 'constructor', 2);

      expect(target.constructor).toBe(2);
    });
  });

  describe('ordinary keys', () => {
    it('should behave like plain assignment', () => {
      const target: Record<string, unknown> = {};
      setDataProperty(target, 'a', 1);

      expect(target.a).toBe(1);
    });
  });

  describe('array access', () => {
    it('should not interfere with array index assignment', () => {
      const target = [1, 2];
      setDataProperty(target, '1', 9);
      setDataProperty(target, '2', 3);

      expect(target).toEqual([1, 9, 3]);
      expect(target.length).toBe(3);
    });
  });
});
