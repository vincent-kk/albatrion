import { beforeEach, describe, expect, it } from 'vitest';

import { setValueByPointer } from '@/json/JSONPointer/utils/manipulator/setValueByPointer';

describe('setValueByPointer', () => {
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
    setValueByPointer(testObj, '/foo/bar/baz', 100);
    expect(testObj.foo.bar.baz).toBe(100);
  });

  it('should set value using array pointer', () => {
    setValueByPointer(testObj, ['foo', 'bar', 'baz'], 100);
    expect(testObj.foo.bar.baz).toBe(100);
  });

  it('should create intermediate objects if they do not exist', () => {
    setValueByPointer(testObj, '/foo/newPath/deep', 'new value');
    expect(testObj.foo.newPath.deep).toBe('new value');
  });

  it('should modify array elements', () => {
    setValueByPointer(testObj, '/foo/arr/0', 999);
    expect(testObj.foo.arr[0]).toBe(999);

    setValueByPointer(testObj, '/foo/arr/2/key', 'modified');
    expect(testObj.foo.arr[2].key).toBe('modified');
  });

  it('should handle setting various types of values', () => {
    setValueByPointer(testObj, '/newNull', null);
    expect(testObj.newNull).toBeNull();

    setValueByPointer(testObj, '/newObj', { test: true });
    expect(testObj.newObj).toEqual({ test: true });

    setValueByPointer(testObj, '/newArr', [1, 2, 3]);
    expect(testObj.newArr).toEqual([1, 2, 3]);
  });

  it('should throw error for invalid input', () => {
    expect(() => setValueByPointer(null as any, '/foo', 'value')).toThrow(
      '`input` must be a plain object or an array.',
    );
    expect(() => setValueByPointer(undefined as any, '/foo', 'value')).toThrow(
      '`input` must be a plain object or an array.',
    );
    const result = [] as any;
    setValueByPointer(result, '/foo', 'value');
    const expected = new Array();
    (expected as any).foo = 'value';
    expect(result).toEqual(expected);
  });

  it('should handle array index out of bounds', () => {
    expect(setValueByPointer(testObj, '/foo/arr/5', 'value')).toEqual({
      foo: {
        bar: {
          baz: 42,
        },
        arr: [1, 2, { key: 'value' }, undefined, undefined, 'value'],
      },
      empty: {},
    });
    expect(setValueByPointer(testObj, '/foo/arr/-1', 'value')).toEqual(testObj);
  });

  it('should handle setting values on non-objects', () => {
    setValueByPointer(testObj, '/foo/bar/baz', 42);
    expect(() =>
      setValueByPointer(testObj, '/foo/bar/baz/impossible', 'value'),
    ).toThrow();
  });

  it('should handle empty path segments', () => {
    expect(setValueByPointer(testObj, '//', 'value')).toEqual({
      foo: {
        bar: {
          baz: 42,
        },
        arr: [1, 2, { key: 'value' }],
      },
      empty: {},
      '': { '': 'value' },
    });
    expect(setValueByPointer(testObj, ['', '', ''], 'value')).toEqual({
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
    expect(setValueByPointer(testObj, '#', 'value')).toEqual('value');
  });
});
