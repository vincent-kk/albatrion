import { describe, expect, it } from 'vitest';

import { getValueByPointer } from '../getValueByPointer';

describe('getValueByPointer', () => {
  // 기본 객체 테스트
  it('should return the input object when segments array is empty', () => {
    const input = { foo: 'bar' };
    expect(getValueByPointer(input, [])).toBe(input);
  });

  // 단일 레벨 객체 접근 테스트
  it('should return value for single level object access', () => {
    const input = { foo: 'bar', baz: 42 };
    expect(getValueByPointer(input, ['foo'])).toBe('bar');
    expect(getValueByPointer(input, ['baz'])).toBe(42);
  });

  // 중첩 객체 접근 테스트
  it('should return value for nested object access', () => {
    const input = {
      foo: {
        bar: {
          baz: 'value',
        },
      },
    };
    expect(getValueByPointer(input, ['', 'foo', 'bar', 'baz'])).toBe('value');
    expect(getValueByPointer(input, ['foo', 'bar', 'baz'])).toBe('value');
  });

  // 배열 접근 테스트
  it('should handle array access', () => {
    const input = {
      arr: ['first', 'second', 'third'],
    };
    expect(getValueByPointer(input, ['arr', '1'])).toBe('second');
  });

  // 존재하지 않는 경로 테스트
  it('should return undefined for non-existent paths', () => {
    const input = { foo: 'bar' };
    expect(getValueByPointer(input, ['nonexistent'])).toBeUndefined();
    expect(getValueByPointer(input, ['foo', 'nonexistent'])).toBeUndefined();
  });

  // null/undefined 값 처리 테스트
  it('should handle null and undefined values', () => {
    const input = {
      nullValue: null,
      nested: {
        undefinedValue: undefined,
      },
    };
    expect(getValueByPointer(input, ['nullValue'])).toBeNull();
    expect(
      getValueByPointer(input, ['nested', 'undefinedValue']),
    ).toBeUndefined();
  });

  // 배열 루트 테스트
  it('should work with array as root', () => {
    const input = ['first', { second: 'value' }, 'third'];
    expect(getValueByPointer(input, ['1', 'second'])).toBe('value');
    expect(getValueByPointer(input, ['0'])).toBe('first');
  });
});
