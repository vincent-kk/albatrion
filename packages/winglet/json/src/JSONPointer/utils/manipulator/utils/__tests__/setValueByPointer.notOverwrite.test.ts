import { describe, expect, it } from 'vitest';

import { setValueByPointer } from '../setValueByPointer';

describe('setValue, not overwrite', () => {
  describe('object handling', () => {
    it('should set value in simple object path', () => {
      const obj = {};
      setValueByPointer(obj, ['foo'], 'bar', false, false);
      expect(obj).toEqual({ foo: 'bar' });
    });

    it('should set value in nested object path', () => {
      const obj = {};
      setValueByPointer(obj, ['foo', 'bar'], 'baz', false, false);
      expect(obj).toEqual({ foo: { bar: 'baz' } });
    });

    it('should override existing values', () => {
      const obj = { foo: { bar: 'old' } };
      setValueByPointer(obj, ['foo', 'bar'], 'new', false, false);
      expect(obj).toEqual({ foo: { bar: 'old' } });
    });

    it('should write reserved member keys as own data when absent even without overwrite', () => {
      const obj = {};
      const original = setValueByPointer(
        obj,
        ['__proto__'],
        'value',
        false,
        false,
      );
      expect(
        Object.getOwnPropertyDescriptor(original, '__proto__')?.value,
      ).toBe('value');
      expect(Object.getPrototypeOf(obj)).toBe(Object.prototype);
      expect(({} as Record<string, unknown>).value).toBeUndefined();
    });
  });

  describe('array handling', () => {
    it('should set value in array using numeric index', () => {
      const arr = ['a', 'b', 'c'];
      setValueByPointer(arr, ['1'], 'new', false, false);
      expect(arr).toEqual(['a', 'b', 'c']);
    });

    it('should append to array using "-" index', () => {
      const obj = { arr: ['a', 'b'] };
      setValueByPointer(obj, ['arr', '-'], 'c', false, false);
      expect(obj).toEqual({ arr: ['a', 'b', 'c'] });
    });

    it('should create arrays when needed', () => {
      const obj = {};
      setValueByPointer(obj, ['arr', '0'], 'first', false, false);
      expect(obj).toEqual({ arr: ['first'] });
    });
  });

  describe('deletion handling', () => {
    it('should delete property when value is undefined', () => {
      const obj = { foo: { bar: 'baz' } };
      setValueByPointer(obj, ['foo', 'bar'], undefined, false, false);
      expect(obj).toEqual({ foo: {} });
    });

    it('should handle deletion of array elements', () => {
      const obj = { arr: ['a', 'b', 'c'] };
      setValueByPointer(obj, ['arr', '1'], undefined, true, false);
      expect(obj.arr[1]).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should return original for empty segments', () => {
      const obj = { foo: 'bar' };
      const result = setValueByPointer(obj, [], 'new', false, false);
      expect(result).toBe('new');
    });

    it('should handle non-existent intermediate paths', () => {
      const obj = {};
      setValueByPointer(obj, ['a', 'b', 'c'], 'value', false, false);
      expect(obj).toEqual({ a: { b: { c: 'value' } } });
    });

    it('should handle mixed object and array paths', () => {
      const obj = {};
      setValueByPointer(obj, ['users', '0', 'name'], 'Alice', false, false);
      expect(obj).toEqual({ users: [{ name: 'Alice' }] });
    });
  });

  describe('null intermediate path handling (preserveNull=true)', () => {
    it('should return original when encountering null in path', () => {
      const obj = { profile: null };
      const result = setValueByPointer(
        obj,
        ['profile', 'name'],
        'John',
        false,
        true,
      );
      expect(result).toBe(obj);
      expect(obj).toEqual({ profile: null });
    });

    it('should return original when encountering null in path', () => {
      const obj = { profile: null };
      const result = setValueByPointer(
        obj,
        ['', 'profile', 'name'],
        'John',
        false,
        true,
      );
      expect(result).toBe(obj);
      expect(obj).toEqual({ profile: null });
    });

    it('should return original when null in array path', () => {
      const obj = { items: null };
      const result = setValueByPointer(
        obj,
        ['items', '0'],
        'first',
        false,
        true,
      );
      expect(result).toBe(obj);
      expect(obj).toEqual({ items: null });
    });

    it('should return original when null with "-" segment', () => {
      const obj = { items: null };
      const result = setValueByPointer(
        obj,
        ['items', '-'],
        'first',
        false,
        true,
      );
      expect(result).toBe(obj);
      expect(obj).toEqual({ items: null });
    });

    it('should return original for deeply nested null', () => {
      const obj = { a: { b: null } };
      const result = setValueByPointer(
        obj,
        ['a', 'b', 'c'],
        'value',
        false,
        true,
      );
      expect(result).toBe(obj);
      expect(obj).toEqual({ a: { b: null } });
    });

    it('should set null as final value when path exists', () => {
      const obj = { foo: 'bar' };
      setValueByPointer(obj, ['foo'], null, false, true);
      expect(obj).toEqual({ foo: 'bar' });
    });

    it('should return original when null in mixed path', () => {
      const obj = { users: null };
      const result = setValueByPointer(
        obj,
        ['users', '0', 'name'],
        'Alice',
        false,
        true,
      );
      expect(result).toBe(obj);
      expect(obj).toEqual({ users: null });
    });
  });
});
