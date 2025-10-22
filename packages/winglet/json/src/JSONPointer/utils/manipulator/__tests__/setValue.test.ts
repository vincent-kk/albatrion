import { beforeEach, describe, expect, it } from 'vitest';

import { setValue } from '@/json/JSONPointer/utils/manipulator/setValue';

describe('setValue', () => {
  let testObj: any;

  beforeEach(() => {
    testObj = {
      foo: {
        bar: {
          baz: 42,
        },
        arr: [1, 2, { key: 'value' }],
      },
      empty: {},
    };
  });

  it('should set value using string pointer', () => {
    setValue(testObj, '/foo/bar/baz', 100);
    expect(testObj.foo.bar.baz).toBe(100);
  });

  it('should set value using array pointer', () => {
    setValue(testObj, ['foo', 'bar', 'baz'], 100);
    expect(testObj.foo.bar.baz).toBe(100);
  });

  it('should create intermediate objects if they do not exist', () => {
    setValue(testObj, '/foo/newPath/deep', 'new value');
    expect(testObj.foo.newPath.deep).toBe('new value');
  });

  it('should modify array elements', () => {
    setValue(testObj, '/foo/arr/0', 999);
    expect(testObj.foo.arr[0]).toBe(999);

    setValue(testObj, '/foo/arr/2/key', 'modified');
    expect(testObj.foo.arr[2].key).toBe('modified');
  });

  it('should handle setting various types of values', () => {
    setValue(testObj, '/newNull', null);
    expect(testObj.newNull).toBeNull();

    setValue(testObj, '/newObj', { test: true });
    expect(testObj.newObj).toEqual({ test: true });

    setValue(testObj, '/newArr', [1, 2, 3]);
    expect(testObj.newArr).toEqual([1, 2, 3]);
  });

  it('should throw error for invalid input', () => {
    expect(() => setValue(null as any, '/foo', 'value')).toThrow(
      '`input` must be a plain object or an array.',
    );
    expect(() => setValue(undefined as any, '/foo', 'value')).toThrow(
      '`input` must be a plain object or an array.',
    );
    const result = [] as any;
    setValue(result, '/foo', 'value');
    const expected = new Array();
    (expected as any).foo = 'value';
    expect(result).toEqual(expected);
  });

  it('should handle array index out of bounds', () => {
    expect(setValue(testObj, '/foo/arr/5', 'value')).toEqual({
      foo: {
        bar: {
          baz: 42,
        },
        arr: [1, 2, { key: 'value' }, undefined, undefined, 'value'],
      },
      empty: {},
    });
    expect(setValue(testObj, '/foo/arr/-1', 'value')).toEqual(testObj);
  });

  it('should handle setting values on non-objects', () => {
    setValue(testObj, '/foo/bar/baz', 42);
    expect(() =>
      setValue(testObj, '/foo/bar/baz/impossible', 'value'),
    ).toThrow();
  });

  it('should handle empty path segments', () => {
    expect(setValue(testObj, '//', 'value')).toEqual({
      foo: {
        bar: {
          baz: 42,
        },
        arr: [1, 2, { key: 'value' }],
      },
      empty: {},
      '': { '': 'value' },
    });
    expect(setValue(testObj, ['', '', ''], 'value')).toEqual({
      foo: {
        bar: {
          baz: 42,
        },
        arr: [1, 2, { key: 'value' }],
      },
      empty: {},
      '': { '': 'value' },
    });
  });

  it('should return value if root path is provided', () => {
    expect(setValue(testObj, '#', 'value')).toEqual('value');
  });

  describe('options.overwrite', () => {
    it('should overwrite existing values when overwrite is true (default)', () => {
      const obj = { foo: { bar: 'old' } };
      setValue(obj, '/foo/bar', 'new');
      expect(obj.foo.bar).toBe('new');
    });

    it('should overwrite existing values when overwrite is explicitly true', () => {
      const obj = { foo: { bar: 'old' } };
      setValue(obj, '/foo/bar', 'new', { overwrite: true });
      expect(obj.foo.bar).toBe('new');
    });

    it('should not overwrite existing values when overwrite is false', () => {
      const obj = { foo: { bar: 'old' } };
      setValue(obj, '/foo/bar', 'new', { overwrite: false });
      expect(obj.foo.bar).toBe('old');
    });

    it('should set new values even when overwrite is false', () => {
      const obj: any = { foo: {} };
      setValue(obj, '/foo/bar', 'new', { overwrite: false });
      expect(obj.foo.bar).toBe('new');
    });

    it('should not overwrite undefined values when key exists and overwrite is false', () => {
      const obj: any = { foo: { bar: undefined } };
      setValue(obj, '/foo/bar', 'new', { overwrite: false });
      // Key exists (even with undefined value), so it won't be overwritten
      expect(obj.foo.bar).toBeUndefined();
    });

    it('should set value when key does not exist', () => {
      const obj: any = { foo: {} };
      // Key 'bar' doesn't exist
      setValue(obj, '/foo/bar', 'new', { overwrite: false });
      expect(obj.foo.bar).toBe('new');
    });
  });

  describe('options.preserveNull', () => {
    it('should replace null with object by default (preserveNull=false)', () => {
      const obj = { profile: null };
      setValue(obj, '/profile/name', 'John');
      expect(obj).toEqual({ profile: { name: 'John' } });
    });

    it('should replace null when preserveNull is explicitly false', () => {
      const obj = { profile: null };
      setValue(obj, '/profile/name', 'John', { preserveNull: false });
      expect(obj).toEqual({ profile: { name: 'John' } });
    });

    it('should preserve null when preserveNull is true', () => {
      const obj = { profile: null };
      const result = setValue(obj, '/profile/name', 'John', {
        preserveNull: true,
      });
      expect(result).toBe(obj);
      expect(obj).toEqual({ profile: null });
    });

    it('should replace null with array when next segment is numeric', () => {
      const obj = { items: null };
      setValue(obj, '/items/0', 'first', { preserveNull: false });
      expect(obj).toEqual({ items: ['first'] });
    });

    it('should preserve null in array path when preserveNull is true', () => {
      const obj = { items: null };
      setValue(obj, '/items/0', 'first', { preserveNull: true });
      expect(obj).toEqual({ items: null });
    });

    it('should handle deeply nested null paths', () => {
      const obj = { a: { b: null } };
      setValue(obj, '/a/b/c/d', 'value', { preserveNull: false });
      expect(obj).toEqual({ a: { b: { c: { d: 'value' } } } });
    });

    it('should preserve deeply nested null', () => {
      const obj = { a: { b: null } };
      setValue(obj, '/a/b/c/d', 'value', { preserveNull: true });
      expect(obj).toEqual({ a: { b: null } });
    });

    it('should allow setting final value to null regardless of preserveNull', () => {
      const obj1 = { foo: 'bar' };
      setValue(obj1, '/foo', null, { preserveNull: false });
      expect(obj1.foo).toBeNull();

      const obj2 = { foo: 'bar' };
      setValue(obj2, '/foo', null, { preserveNull: true });
      expect(obj2.foo).toBeNull();
    });
  });

  describe('combined options', () => {
    it('should respect both overwrite=false and preserveNull=false', () => {
      const obj = { profile: null, existing: 'value' };
      setValue(obj, '/profile/name', 'John', {
        overwrite: false,
        preserveNull: false,
      });
      expect(obj).toEqual({ profile: { name: 'John' }, existing: 'value' });
    });

    it('should respect both overwrite=false and preserveNull=true', () => {
      const obj = { profile: null, existing: 'old' };
      setValue(obj, '/profile/name', 'John', {
        overwrite: false,
        preserveNull: true,
      });
      expect(obj).toEqual({ profile: null, existing: 'old' });
    });

    it('should respect both overwrite=true and preserveNull=true', () => {
      const obj = { profile: null, existing: 'old' };
      setValue(obj, '/profile/name', 'John', {
        overwrite: true,
        preserveNull: true,
      });
      expect(obj).toEqual({ profile: null, existing: 'old' });

      setValue(obj, '/existing', 'new', {
        overwrite: true,
        preserveNull: true,
      });
      expect(obj.existing).toBe('new');
    });

    it('should handle complex scenario with multiple options', () => {
      const obj = {
        data: null,
        config: { setting: 'original' },
        items: [1, 2, 3],
      };

      // Preserve null
      setValue(obj, '/data/nested', 'value', { preserveNull: true });
      expect(obj.data).toBeNull();

      // Don't overwrite existing
      setValue(obj, '/config/setting', 'new', { overwrite: false });
      expect(obj.config.setting).toBe('original');

      // Both options
      setValue(obj, '/items/0', 999, { overwrite: true, preserveNull: false });
      expect(obj.items[0]).toBe(999);
    });
  });
});
