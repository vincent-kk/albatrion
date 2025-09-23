import { describe, expect, test } from 'vitest';

import { unionRequired } from '../unionRequired';

describe('unionRequired', () => {
  test('두 배열을 합치고 중복 제거', () => {
    const result = unionRequired(['a', 'b'], ['b', 'c']);
    expect(result).toEqual(['a', 'b', 'c']);
  });

  test('중복이 많은 경우', () => {
    const result = unionRequired(['a', 'b', 'c'], ['b', 'c', 'd', 'a']);
    expect(result).toEqual(['a', 'b', 'c', 'd']);
  });

  test('base만 있는 경우 원본 반환', () => {
    const baseArray = ['a', 'b'];
    const result = unionRequired(baseArray, undefined);

    expect(result).toEqual(['a', 'b']);
    expect(result).toBe(baseArray); // 새로운 배열이어야 함
  });

  test('source만 있는 경우 원본 반환', () => {
    const sourceArray = ['c', 'd'];
    const result = unionRequired(undefined, sourceArray);

    expect(result).toEqual(['c', 'd']);
    expect(result).toBe(sourceArray); // 새로운 배열이어야 함
  });

  test('둘 다 없으면 undefined', () => {
    expect(unionRequired(undefined, undefined)).toBeUndefined();
  });

  test('빈 배열들', () => {
    expect(unionRequired([], [])).toEqual([]);
    expect(unionRequired(['a'], [])).toEqual(['a']);
    expect(unionRequired([], ['b'])).toEqual(['b']);
  });

  test('동일한 배열', () => {
    const result = unionRequired(['a', 'b', 'c'], ['a', 'b', 'c']);
    expect(result).toEqual(['a', 'b', 'c']);
  });

  test('완전히 다른 배열', () => {
    const result = unionRequired(['a', 'b'], ['c', 'd']);
    expect(result).toEqual(['a', 'b', 'c', 'd']);
  });

  test('단일 요소 배열들', () => {
    const result = unionRequired(['a'], ['b']);
    expect(result).toEqual(['a', 'b']);
  });

  test('하나는 단일 요소, 하나는 여러 요소', () => {
    const result = unionRequired(['a'], ['a', 'b', 'c']);
    expect(result).toEqual(['a', 'b', 'c']);
  });

  test('순서 보존 확인', () => {
    const result = unionRequired(['z', 'y'], ['a', 'b']);
    expect(result).toEqual(['z', 'y', 'a', 'b']);
  });

  test('중복 요소가 여러 번 있는 경우', () => {
    const result = unionRequired(['a', 'a', 'b'], ['b', 'b', 'c']);
    expect(result).toEqual(['a', 'b', 'c']); // 중복 완전 제거
  });
});
