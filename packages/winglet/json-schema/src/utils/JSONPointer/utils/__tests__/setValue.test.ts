import { describe, expect, it } from 'vitest';

import { setValue } from '../setValue';

describe('setValue', () => {
  describe('object handling', () => {
    it('should set value in simple object path', () => {
      const obj = {};
      setValue(obj, ['foo'], 'bar');
      expect(obj).toEqual({ foo: 'bar' });
    });

    it('should set value in nested object path', () => {
      const obj = {};
      setValue(obj, ['foo', 'bar'], 'baz');
      expect(obj).toEqual({ foo: { bar: 'baz' } });
    });

    it('should override existing values', () => {
      const obj = { foo: { bar: 'old' } };
      setValue(obj, ['foo', 'bar'], 'new');
      expect(obj).toEqual({ foo: { bar: 'new' } });
    });

    it('should handle forbidden keys', () => {
      const obj = {};
      const original = setValue(obj, ['__proto__'], 'malicious');
      expect(original).toEqual({});
      expect(Object.getPrototypeOf(obj)).not.toHaveProperty('malicious');
    });
  });

  describe('array handling', () => {
    it('should set value in array using numeric index', () => {
      const arr = ['a', 'b', 'c'];
      setValue(arr, ['1'], 'new');
      expect(arr).toEqual(['a', 'new', 'c']);
    });

    it('should append to array using "-" index', () => {
      const obj = { arr: ['a', 'b'] };
      setValue(obj, ['arr', '-'], 'c');
      expect(obj).toEqual({ arr: ['a', 'b', 'c'] });
    });

    it('should create arrays when needed', () => {
      const obj = {};
      setValue(obj, ['arr', '0'], 'first');
      expect(obj).toEqual({ arr: ['first'] });
    });
  });

  describe('deletion handling', () => {
    it('should delete property when value is undefined', () => {
      const obj = { foo: { bar: 'baz' } };
      setValue(obj, ['foo', 'bar'], undefined);
      expect(obj).toEqual({ foo: {} });
    });

    it('should handle deletion of array elements', () => {
      const obj = { arr: ['a', 'b', 'c'] };
      setValue(obj, ['arr', '1'], undefined);
      expect(obj.arr[1]).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should return original for empty segments', () => {
      const obj = { foo: 'bar' };
      const result = setValue(obj, [], 'new');
      expect(result).toBe(obj);
    });

    it('should handle non-existent intermediate paths', () => {
      const obj = {};
      setValue(obj, ['a', 'b', 'c'], 'value');
      expect(obj).toEqual({ a: { b: { c: 'value' } } });
    });

    it('should handle mixed object and array paths', () => {
      const obj = {};
      setValue(obj, ['users', '0', 'name'], 'Alice');
      expect(obj).toEqual({ users: [{ name: 'Alice' }] });
    });
  });
});
