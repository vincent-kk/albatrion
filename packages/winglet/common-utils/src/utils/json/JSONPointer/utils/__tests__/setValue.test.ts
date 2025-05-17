import { describe, expect, it } from 'vitest';

import { setValue } from '../setValue';

describe('setValue', () => {
  describe('object handling', () => {
    it('should set value in simple object path', () => {
      const obj = {};
      setValue(obj, ['foo'], 'bar', true);
      expect(obj).toEqual({ foo: 'bar' });
    });

    it('should set value in nested object path', () => {
      const obj = {};
      setValue(obj, ['foo', 'bar'], 'baz', true);
      expect(obj).toEqual({ foo: { bar: 'baz' } });
    });

    it('should override existing values', () => {
      const obj = { foo: { bar: 'old' } };
      setValue(obj, ['foo', 'bar'], 'new', true);
      expect(obj).toEqual({ foo: { bar: 'new' } });
    });

    it('should handle forbidden keys', () => {
      const obj = {};
      const original = setValue(obj, ['__proto__'], 'malicious', true);
      expect(original).toEqual({});
      expect(Object.getPrototypeOf(obj)).not.toHaveProperty('malicious');
    });
  });

  describe('array handling', () => {
    it('should set value in array using numeric index', () => {
      const arr = ['a', 'b', 'c'];
      setValue(arr, ['1'], 'new', true);
      expect(arr).toEqual(['a', 'new', 'c']);
    });

    it('should append to array using "-" index', () => {
      const obj = { arr: ['a', 'b'] };
      setValue(obj, ['arr', '-'], 'c', true);
      expect(obj).toEqual({ arr: ['a', 'b', 'c'] });
    });

    it('should create arrays when needed', () => {
      const obj = {};
      setValue(obj, ['arr', '0'], 'first', true);
      expect(obj).toEqual({ arr: ['first'] });
    });
  });

  describe('deletion handling', () => {
    it('should delete property when value is undefined', () => {
      const obj = { foo: { bar: 'baz' } };
      setValue(obj, ['foo', 'bar'], undefined, true);
      expect(obj).toEqual({ foo: {} });
    });

    it('should handle deletion of array elements', () => {
      const obj = { arr: ['a', 'b', 'c'] };
      setValue(obj, ['arr', '1'], undefined, true);
      expect(obj.arr[1]).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should return original for empty segments', () => {
      const obj = { foo: 'bar' };
      const result = setValue(obj, [], 'new', true);
      expect(result).toBe('new');
    });

    it('should handle non-existent intermediate paths', () => {
      const obj = {};
      setValue(obj, ['a', 'b', 'c'], 'value', true);
      expect(obj).toEqual({ a: { b: { c: 'value' } } });
    });

    it('should handle mixed object and array paths', () => {
      const obj = {};
      setValue(obj, ['users', '0', 'name'], 'Alice', true);
      expect(obj).toEqual({ users: [{ name: 'Alice' }] });
    });
  });
});

describe('setValue, not overwrite', () => {
  describe('object handling', () => {
    it('should set value in simple object path', () => {
      const obj = {};
      setValue(obj, ['foo'], 'bar', false);
      expect(obj).toEqual({ foo: 'bar' });
    });

    it('should set value in nested object path', () => {
      const obj = {};
      setValue(obj, ['foo', 'bar'], 'baz', false);
      expect(obj).toEqual({ foo: { bar: 'baz' } });
    });

    it('should override existing values', () => {
      const obj = { foo: { bar: 'old' } };
      setValue(obj, ['foo', 'bar'], 'new', false);
      expect(obj).toEqual({ foo: { bar: 'old' } });
    });

    it('should handle forbidden keys', () => {
      const obj = {};
      const original = setValue(obj, ['__proto__'], 'malicious', false);
      expect(original).toEqual({});
      expect(Object.getPrototypeOf(obj)).not.toHaveProperty('malicious');
    });
  });

  describe('array handling', () => {
    it('should set value in array using numeric index', () => {
      const arr = ['a', 'b', 'c'];
      setValue(arr, ['1'], 'new', false);
      expect(arr).toEqual(['a', 'b', 'c']);
    });

    it('should append to array using "-" index', () => {
      const obj = { arr: ['a', 'b'] };
      setValue(obj, ['arr', '-'], 'c', false);
      expect(obj).toEqual({ arr: ['a', 'b', 'c'] });
    });

    it('should create arrays when needed', () => {
      const obj = {};
      setValue(obj, ['arr', '0'], 'first', false);
      expect(obj).toEqual({ arr: ['first'] });
    });
  });

  describe('deletion handling', () => {
    it('should delete property when value is undefined', () => {
      const obj = { foo: { bar: 'baz' } };
      setValue(obj, ['foo', 'bar'], undefined, false);
      expect(obj).toEqual({ foo: {} });
    });

    it('should handle deletion of array elements', () => {
      const obj = { arr: ['a', 'b', 'c'] };
      setValue(obj, ['arr', '1'], undefined, true);
      expect(obj.arr[1]).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should return original for empty segments', () => {
      const obj = { foo: 'bar' };
      const result = setValue(obj, [], 'new', false);
      expect(result).toBe('new');
    });

    it('should handle non-existent intermediate paths', () => {
      const obj = {};
      setValue(obj, ['a', 'b', 'c'], 'value', false);
      expect(obj).toEqual({ a: { b: { c: 'value' } } });
    });

    it('should handle mixed object and array paths', () => {
      const obj = {};
      setValue(obj, ['users', '0', 'name'], 'Alice', false);
      expect(obj).toEqual({ users: [{ name: 'Alice' }] });
    });
  });
});
