import { describe, expect, it } from 'vitest';

import { setValueByPointer } from '../setValueByPointer';

describe('setValueByPointer', () => {
  describe('object handling', () => {
    it('should set value in simple object path', () => {
      const obj = {};
      setValueByPointer(obj, ['foo'], 'bar', true, false);
      expect(obj).toEqual({ foo: 'bar' });
    });

    it('should set value in simple object path', () => {
      const obj = {};
      setValueByPointer(obj, ['', 'foo'], 'bar', true, false);
      expect(obj).toEqual({ foo: 'bar' });
    });

    it('should set value in nested object path', () => {
      const obj = {};
      setValueByPointer(obj, ['foo', 'bar'], 'baz', true, false);
      expect(obj).toEqual({ foo: { bar: 'baz' } });
    });

    it('should set value in nested object path', () => {
      const obj = {};
      setValueByPointer(obj, ['', 'foo', 'bar'], 'baz', true, false);
      expect(obj).toEqual({ foo: { bar: 'baz' } });
    });

    it('should override existing values', () => {
      const obj = { foo: { bar: 'old' } };
      setValueByPointer(obj, ['foo', 'bar'], 'new', true, false);
      expect(obj).toEqual({ foo: { bar: 'new' } });
    });

    it('should override existing values', () => {
      const obj = { foo: { bar: 'old' } };
      setValueByPointer(obj, ['', 'foo', 'bar'], 'new', true, false);
      expect(obj).toEqual({ foo: { bar: 'new' } });
    });

    it('should handle forbidden keys', () => {
      const obj = {};
      const original = setValueByPointer(
        obj,
        ['__proto__'],
        'malicious',
        true,
        false,
      );
      expect(original).toEqual({});
      expect(Object.getPrototypeOf(obj)).not.toHaveProperty('malicious');
    });
  });

  describe('array handling', () => {
    it('should set value in array using numeric index', () => {
      const arr = ['a', 'b', 'c'];
      setValueByPointer(arr, ['1'], 'new', true, false);
      expect(arr).toEqual(['a', 'new', 'c']);
    });

    it('should append to array using "-" index', () => {
      const obj = { arr: ['a', 'b'] };
      setValueByPointer(obj, ['arr', '-'], 'c', true, false);
      expect(obj).toEqual({ arr: ['a', 'b', 'c'] });
    });

    it('should create arrays when needed', () => {
      const obj = {};
      setValueByPointer(obj, ['arr', '0'], 'first', true, false);
      expect(obj).toEqual({ arr: ['first'] });
    });
  });

  describe('deletion handling', () => {
    it('should delete property when value is undefined', () => {
      const obj = { foo: { bar: 'baz' } };
      setValueByPointer(obj, ['foo', 'bar'], undefined, true, false);
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
      const result = setValueByPointer(obj, [], 'new', true, false);
      expect(result).toBe('new');
    });

    it('should handle non-existent intermediate paths', () => {
      const obj = {};
      setValueByPointer(obj, ['a', 'b', 'c'], 'value', true, false);
      expect(obj).toEqual({ a: { b: { c: 'value' } } });
    });

    it('should handle mixed object and array paths', () => {
      const obj = {};
      setValueByPointer(obj, ['users', '0', 'name'], 'Alice', true, false);
      expect(obj).toEqual({ users: [{ name: 'Alice' }] });
    });
  });

  describe('null intermediate path handling (preserveNull=false)', () => {
    it('should overwrite null with object when setting nested path', () => {
      const obj = { profile: null };
      setValueByPointer(obj, ['profile', 'name'], 'John', true, false);
      expect(obj).toEqual({ profile: { name: 'John' } });
    });

    it('should overwrite null with object when setting nested path', () => {
      const obj = { profile: null };
      setValueByPointer(obj, ['', 'profile', 'name'], 'John', true, false);
      expect(obj).toEqual({ profile: { name: 'John' } });
    });

    it('should overwrite null with array when next segment is numeric', () => {
      const obj = { items: null };
      setValueByPointer(obj, ['items', '0'], 'first', true, false);
      expect(obj).toEqual({ items: ['first'] });
    });

    it('should overwrite null with array when next segment is "-"', () => {
      const obj = { items: null };
      setValueByPointer(obj, ['items', '-'], 'first', true, false);
      expect(obj).toEqual({ items: ['first'] });
    });

    it('should handle deeply nested null paths', () => {
      const obj = { a: { b: null } };
      setValueByPointer(obj, ['a', 'b', 'c', 'd'], 'value', true, false);
      expect(obj).toEqual({ a: { b: { c: { d: 'value' } } } });
    });

    it('should set null as final value', () => {
      const obj = { foo: 'bar' };
      setValueByPointer(obj, ['foo'], null, true, false);
      expect(obj).toEqual({ foo: null });
    });

    it('should overwrite null in mixed object/array path', () => {
      const obj = { users: null };
      setValueByPointer(obj, ['users', '0', 'name'], 'Alice', true, false);
      expect(obj).toEqual({ users: [{ name: 'Alice' }] });
    });
  });
});

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

    it('should handle forbidden keys', () => {
      const obj = {};
      const original = setValueByPointer(
        obj,
        ['__proto__'],
        'malicious',
        false,
        false,
      );
      expect(original).toEqual({});
      expect(Object.getPrototypeOf(obj)).not.toHaveProperty('malicious');
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
