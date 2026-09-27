import { describe, expect, test } from 'vitest';

import { unionRequired } from '../unionRequired';

describe('unionRequired', () => {
  test('merges two arrays and removes duplicates', () => {
    const result = unionRequired(['a', 'b'], ['b', 'c']);
    expect(result).toEqual(['a', 'b', 'c']);
  });

  test('when many duplicates exist', () => {
    const result = unionRequired(['a', 'b', 'c'], ['b', 'c', 'd', 'a']);
    expect(result).toEqual(['a', 'b', 'c', 'd']);
  });

  test('returns original when only base exists', () => {
    const baseArray = ['a', 'b'];
    const result = unionRequired(baseArray, undefined);

    expect(result).toEqual(['a', 'b']);
    expect(result).toBe(baseArray); // should be the same array
  });

  test('returns original when only source exists', () => {
    const sourceArray = ['c', 'd'];
    const result = unionRequired(undefined, sourceArray);

    expect(result).toEqual(['c', 'd']);
    expect(result).toBe(sourceArray); // should be the same array
  });

  test('returns undefined when both are empty', () => {
    expect(unionRequired(undefined, undefined)).toBeUndefined();
  });

  test('empty arrays', () => {
    expect(unionRequired([], [])).toEqual([]);
    expect(unionRequired(['a'], [])).toEqual(['a']);
    expect(unionRequired([], ['b'])).toEqual(['b']);
  });

  test('identical arrays', () => {
    const result = unionRequired(['a', 'b', 'c'], ['a', 'b', 'c']);
    expect(result).toEqual(['a', 'b', 'c']);
  });

  test('completely different arrays', () => {
    const result = unionRequired(['a', 'b'], ['c', 'd']);
    expect(result).toEqual(['a', 'b', 'c', 'd']);
  });

  test('single element arrays', () => {
    const result = unionRequired(['a'], ['b']);
    expect(result).toEqual(['a', 'b']);
  });

  test('one single element, one multiple elements', () => {
    const result = unionRequired(['a'], ['a', 'b', 'c']);
    expect(result).toEqual(['a', 'b', 'c']);
  });

  test('order preservation check', () => {
    const result = unionRequired(['z', 'y'], ['a', 'b']);
    expect(result).toEqual(['z', 'y', 'a', 'b']);
  });

  test('when duplicate elements appear multiple times', () => {
    const result = unionRequired(['a', 'a', 'b'], ['b', 'b', 'c']);
    expect(result).toEqual(['a', 'b', 'c']); // fully removes duplicates
  });
});
