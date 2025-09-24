import { describe, expect, test } from 'vitest';

import { intersectEnum } from '../intersectEnum';

describe('intersectEnum', () => {
  test('공통 값만 반환', () => {
    const result = intersectEnum(['a', 'b', 'c'], ['b', 'c', 'd']);
    expect(result).toEqual(['b', 'c']);
  });

  test('교집합이 빈 배열이면 에러', () => {
    expect(() => intersectEnum(['a', 'b'], ['c', 'd'])).toThrow(
      'Enum values must have at least one common value',
    );
  });

  test('완전히 동일한 배열', () => {
    const result = intersectEnum(['a', 'b'], ['a', 'b']);
    expect(result).toEqual(['a', 'b']);
  });

  test('하나의 값만 공통', () => {
    const result = intersectEnum(['a', 'b', 'c'], ['c', 'd', 'e']);
    expect(result).toEqual(['c']);
  });

  test('base만 있는 경우', () => {
    const result = intersectEnum(['a', 'b'], undefined);
    expect(result).toEqual(['a', 'b']);
  });

  test('source만 있는 경우', () => {
    const result = intersectEnum(undefined, ['c', 'd']);
    expect(result).toEqual(['c', 'd']);
  });

  test('둘 다 없으면 undefined', () => {
    const result = intersectEnum(undefined, undefined);
    expect(result).toBeUndefined();
  });

  test('숫자 배열 교집합', () => {
    const result = intersectEnum([1, 2, 3], [2, 3, 4]);
    expect(result).toEqual([2, 3]);
  });

  test('객체 배열 교집합 (참조 동일성)', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const obj3 = { id: 3 };

    const result = intersectEnum([obj1, obj2], [obj2, obj3]);
    expect(result).toEqual([obj2]);
  });

  test('빈 배열들', () => {
    expect(() => intersectEnum([], [])).toThrow(
      'Enum values must have at least one common value',
    );
    expect(() => intersectEnum(['a'], [])).toThrow(
      'Enum values must have at least one common value',
    );
    expect(() => intersectEnum([], ['a'])).toThrow(
      'Enum values must have at least one common value',
    );
  });

  test('중복 값이 있는 경우', () => {
    const result = intersectEnum(['a', 'b', 'b', 'c'], ['b', 'c', 'c', 'd']);
    expect(result).toEqual(['b', 'b', 'c']); // 중복 유지
  });
});
