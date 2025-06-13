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
});
