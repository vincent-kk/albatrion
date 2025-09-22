import { describe, expect, test } from 'vitest';

import { intersectConst } from '../intersectConst';

describe('intersectConst', () => {
  test('같은 값이면 그 값 반환', () => {
    expect(intersectConst('value', 'value')).toBe('value');
    expect(intersectConst(42, 42)).toBe(42);
    expect(intersectConst(true, true)).toBe(true);
    expect(intersectConst(null, null)).toBe(null);
  });

  test('다른 값이면 에러', () => {
    expect(() => intersectConst('value1', 'value2')).toThrow(
      'Conflicting const values: value1 vs value2',
    );
    expect(() => intersectConst(42, 84)).toThrow(
      'Conflicting const values: 42 vs 84',
    );
    expect(() => intersectConst(true, false)).toThrow(
      'Conflicting const values: true vs false',
    );
  });

  test('base만 있으면 base 값 반환', () => {
    expect(intersectConst('value', undefined)).toBe('value');
    expect(intersectConst(42, undefined)).toBe(42);
    expect(intersectConst(false, undefined)).toBe(false);
  });

  test('source만 있으면 source 값 반환', () => {
    expect(intersectConst(undefined, 'value')).toBe('value');
    expect(intersectConst(undefined, 42)).toBe(42);
    expect(intersectConst(undefined, true)).toBe(true);
  });

  test('둘 다 없으면 undefined', () => {
    expect(intersectConst(undefined, undefined)).toBeUndefined();
  });

  test('객체 값 비교 (참조 동일성)', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 1 };

    expect(intersectConst(obj1, obj1)).toBe(obj1); // 동일한 참조
    expect(() => intersectConst(obj1, obj2)).toThrow(
      'Conflicting const values',
    ); // 다른 참조
  });

  test('배열 값 비교', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [1, 2, 3];

    expect(intersectConst(arr1, arr1)).toBe(arr1); // 동일한 참조
    expect(() => intersectConst(arr1, arr2)).toThrow(
      'Conflicting const values',
    ); // 다른 참조
  });

  test('0과 false 같은 falsy 값들', () => {
    expect(intersectConst(0, 0)).toBe(0);
    expect(intersectConst(false, false)).toBe(false);
    expect(intersectConst('', '')).toBe('');
    expect(() => intersectConst(0, false as any)).toThrow(
      'Conflicting const values: 0 vs false',
    );
  });

  test('null과 undefined 구분', () => {
    expect(intersectConst(null, null)).toBe(null);
    expect(intersectConst(null, undefined)).toBe(null);
    expect(intersectConst(undefined, null)).toBe(null);
    expect(() => intersectConst(null, 0)).toThrow('Conflicting const values');
  });
});
