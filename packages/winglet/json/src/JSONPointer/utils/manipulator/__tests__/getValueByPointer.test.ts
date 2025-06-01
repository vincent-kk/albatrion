import { describe, expect, it } from 'vitest';

import { getValueByPointer } from '@/json/JSONPointer/utils/manipulator/getValueByPointer';

describe('getValueByPointer', () => {
  const testObj = {
    foo: {
      bar: {
        baz: 42,
      },
      arr: [1, 2, { key: 'value' }],
    },
    empty: {},
    nullValue: null,
    zero: 0,
    falseValue: false,
  };

  it('should get value using string pointer', () => {
    expect(getValueByPointer(testObj, '/foo/bar/baz')).toBe(42);
  });

  it('should get value using array pointer', () => {
    expect(getValueByPointer(testObj, ['foo', 'bar', 'baz'])).toBe(42);
  });

  it('should get array elements', () => {
    expect(getValueByPointer(testObj, '/foo/arr/0')).toBe(1);
    expect(getValueByPointer(testObj, '/foo/arr/2/key')).toBe('value');
  });

  it('should handle empty objects', () => {
    expect(getValueByPointer(testObj, '/empty')).toEqual({});
  });

  it('should handle falsy values correctly', () => {
    expect(getValueByPointer(testObj, '/nullValue')).toBeNull();
    expect(getValueByPointer(testObj, '/zero')).toBe(0);
    expect(getValueByPointer(testObj, '/falseValue')).toBe(false);
  });

  it('should throw error for invalid input', () => {
    expect(() => getValueByPointer(null as any, '/foo')).toThrow(
      '`input` must be a plain object or an array.',
    );
    expect(() => getValueByPointer(undefined as any, '/foo')).toThrow(
      '`input` must be a plain object or an array.',
    );
    expect(getValueByPointer([] as any, '/foo')).toEqual(undefined);
  });

  it('should handle non-existent paths', () => {
    expect(getValueByPointer(testObj, '/nonexistent')).toEqual(undefined);
    expect(getValueByPointer(testObj, '/foo/bar/nonexistent')).toEqual(
      undefined,
    );
  });

  it('should handle empty path segments', () => {
    expect(getValueByPointer(testObj, '//')).toEqual(undefined);
    expect(getValueByPointer(testObj, ['', ''])).toEqual(undefined);
  });
});
