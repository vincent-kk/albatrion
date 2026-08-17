import { describe, expect, test } from 'vitest';

import { intersectEnum } from '../intersectEnum';

describe('intersectEnum', () => {
  test('returns only common values', () => {
    const result = intersectEnum(['a', 'b', 'c'], ['b', 'c', 'd']);
    expect(result).toEqual(['b', 'c']);
  });

  test('throws error when intersection is empty', () => {
    expect(() => intersectEnum(['a', 'b'], ['c', 'd'])).toThrow(
      'Empty enum intersection in schema merge',
    );
  });

  test('identical arrays', () => {
    const result = intersectEnum(['a', 'b'], ['a', 'b']);
    expect(result).toEqual(['a', 'b']);
  });

  test('only one common value', () => {
    const result = intersectEnum(['a', 'b', 'c'], ['c', 'd', 'e']);
    expect(result).toEqual(['c']);
  });

  test('when only base exists', () => {
    const result = intersectEnum(['a', 'b'], undefined);
    expect(result).toEqual(['a', 'b']);
  });

  test('when only source exists', () => {
    const result = intersectEnum(undefined, ['c', 'd']);
    expect(result).toEqual(['c', 'd']);
  });

  test('returns undefined when both are undefined', () => {
    const result = intersectEnum(undefined, undefined);
    expect(result).toBeUndefined();
  });

  test('number array intersection', () => {
    const result = intersectEnum([1, 2, 3], [2, 3, 4]);
    expect(result).toEqual([2, 3]);
  });

  test('object array intersection (reference equality)', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const obj3 = { id: 3 };

    const result = intersectEnum([obj1, obj2], [obj2, obj3]);
    expect(result).toEqual([obj2]);
  });

  test('empty arrays', () => {
    expect(() => intersectEnum([], [])).toThrow(
      'Empty enum intersection in schema merge',
    );
    expect(() => intersectEnum(['a'], [])).toThrow(
      'Empty enum intersection in schema merge',
    );
    expect(() => intersectEnum([], ['a'])).toThrow(
      'Empty enum intersection in schema merge',
    );
  });

  test('when duplicate values exist', () => {
    const result = intersectEnum(['a', 'b', 'b', 'c'], ['b', 'c', 'c', 'd']);
    expect(result).toEqual(['b', 'b', 'c']); // preserves duplicates
  });
});
