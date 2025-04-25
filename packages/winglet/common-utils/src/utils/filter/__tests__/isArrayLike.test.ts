import { describe, expect, test } from 'vitest';

import { isArrayLike } from '../isArrayLike';

describe('isArrayLike', () => {
  test('배열은 true를 반환해야 합니다', () => {
    expect(isArrayLike([])).toBe(true);
    expect(isArrayLike([1, 2, 3])).toBe(true);
  });

  test('유사 배열 객체는 true를 반환해야 합니다', () => {
    const arrayLikeObject = {
      0: 'first',
      1: 'second',
      length: 2,
    };
    expect(isArrayLike(arrayLikeObject)).toBe(true);

    // DOM NodeList와 유사한 객체
    const nodeListLike = {
      0: 'node1',
      1: 'node2',
      2: 'node3',
      length: 3,
    };
    expect(isArrayLike(nodeListLike)).toBe(true);
  });

  test('문자열은 length를 가지고 있지만 false를 반환합니다', () => {
    expect(isArrayLike('')).toBe(false);
    expect(isArrayLike('hello')).toBe(false);
  });

  test('null과 undefined는 false를 반환해야 합니다', () => {
    expect(isArrayLike(null)).toBe(false);
    expect(isArrayLike(undefined)).toBe(false);
  });

  test('일반 객체는 false를 반환해야 합니다', () => {
    expect(isArrayLike({})).toBe(false);
    expect(isArrayLike({ a: 1, b: 2 })).toBe(false);
  });

  test('숫자와 불리언은 false를 반환해야 합니다', () => {
    expect(isArrayLike(42)).toBe(false);
    expect(isArrayLike(true)).toBe(false);
    expect(isArrayLike(false)).toBe(false);
  });

  test('잘못된 length 속성을 가진 객체는 false를 반환해야 합니다', () => {
    expect(isArrayLike({ length: 'not a number' })).toBe(false);
    expect(isArrayLike({ length: -1 })).toBe(false);
  });
});
