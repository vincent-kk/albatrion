import { describe, expect, it } from 'vitest';

import { getValue } from '../getValue';

describe('getValue', () => {
  // 기본 객체 테스트
  it('should return the input object when segments array is empty', () => {
    const input = { foo: 'bar' };
    expect(getValue(input, [])).toBe(input);
  });

  // 단일 레벨 객체 접근 테스트
  it('should return value for single level object access', () => {
    const input = { foo: 'bar', baz: 42 };
    expect(getValue(input, ['foo'])).toBe('bar');
    expect(getValue(input, ['baz'])).toBe(42);
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
    expect(getValue(input, ['foo', 'bar', 'baz'])).toBe('value');
  });

  // 배열 접근 테스트
  it('should handle array access', () => {
    const input = {
      arr: ['first', 'second', 'third'],
    };
    expect(getValue(input, ['arr', '1'])).toBe('second');
  });

  // 이스케이프된 문자 처리 테스트
  it('should handle escaped characters in property names', () => {
    const input = {
      'foo/bar': 'value',
      'foo~bar': 'escaped',
    };
    expect(getValue(input, ['foo~1bar'])).toBe('value'); // /가 ~1로 이스케이프됨
    expect(getValue(input, ['foo~0bar'])).toBe('escaped'); // ~가 ~0으로 이스케이프됨
  });

  // 존재하지 않는 경로 테스트
  it('should return undefined for non-existent paths', () => {
    const input = { foo: 'bar' };
    expect(getValue(input, ['nonexistent'])).toBeUndefined();
    expect(getValue(input, ['foo', 'nonexistent'])).toBeUndefined();
  });

  // null/undefined 값 처리 테스트
  it('should handle null and undefined values', () => {
    const input = {
      nullValue: null,
      nested: {
        undefinedValue: undefined,
      },
    };
    expect(getValue(input, ['nullValue'])).toBeNull();
    expect(getValue(input, ['nested', 'undefinedValue'])).toBeUndefined();
  });

  // 배열 루트 테스트
  it('should work with array as root', () => {
    const input = ['first', { second: 'value' }, 'third'];
    expect(getValue(input, ['1', 'second'])).toBe('value');
    expect(getValue(input, ['0'])).toBe('first');
  });
});
