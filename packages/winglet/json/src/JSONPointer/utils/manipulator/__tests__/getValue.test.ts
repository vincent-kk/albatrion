import { describe, expect, it } from 'vitest';

import { getValue } from '@/json/JSONPointer/utils/manipulator/getValue';

describe('getValue', () => {
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
    expect(getValue(testObj, '/foo/bar/baz')).toBe(42);
  });

  it('should get value using array pointer', () => {
    expect(getValue(testObj, ['foo', 'bar', 'baz'])).toBe(42);
  });

  it('should get array elements', () => {
    expect(getValue(testObj, '/foo/arr/0')).toBe(1);
    expect(getValue(testObj, '/foo/arr/2/key')).toBe('value');
  });

  it('should handle empty objects', () => {
    expect(getValue(testObj, '/empty')).toEqual({});
  });

  it('should handle falsy values correctly', () => {
    expect(getValue(testObj, '/nullValue')).toBeNull();
    expect(getValue(testObj, '/zero')).toBe(0);
    expect(getValue(testObj, '/falseValue')).toBe(false);
  });

  it('should throw error for invalid input', () => {
    expect(() => getValue(null as any, '/foo')).toThrow(
      '`input` must be a plain object or an array.',
    );
    expect(() => getValue(undefined as any, '/foo')).toThrow(
      '`input` must be a plain object or an array.',
    );
    expect(getValue([] as any, '/foo')).toEqual(undefined);
  });

  it('should handle non-existent paths', () => {
    expect(getValue(testObj, '/nonexistent')).toEqual(undefined);
    expect(getValue(testObj, '/foo/bar/nonexistent')).toEqual(undefined);
  });

  it('should handle empty path segments', () => {
    expect(getValue(testObj, '//')).toEqual(undefined);
    expect(getValue(testObj, ['', ''])).toEqual(undefined);
  });
});
