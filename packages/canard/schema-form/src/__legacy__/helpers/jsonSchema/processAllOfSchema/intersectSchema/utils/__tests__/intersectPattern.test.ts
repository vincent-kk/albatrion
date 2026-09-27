import { describe, expect, test } from 'vitest';

import { intersectPattern } from '../intersectPattern';

describe('intersectPattern', () => {
  test('combines two patterns with AND', () => {
    const result = intersectPattern('^[a-z]+$', '^.{5,}$');
    expect(result).toBe('(?=^[a-z]+$)(?=^.{5,}$)');
  });

  test('complex patterns', () => {
    const result = intersectPattern('[A-Z][a-z]+', '\\d{3}');
    expect(result).toBe('(?=[A-Z][a-z]+)(?=\\d{3})');
  });

  test('returns base value when only base exists', () => {
    const result = intersectPattern('^[a-z]+$', undefined);
    expect(result).toBe('^[a-z]+$');
  });

  test('returns source value when only source exists', () => {
    const result = intersectPattern(undefined, '^.{5,}$');
    expect(result).toBe('^.{5,}$');
  });

  test('returns undefined when both are undefined', () => {
    const result = intersectPattern(undefined, undefined);
    expect(result).toBeUndefined();
  });

  test('identical patterns', () => {
    const pattern = '^[a-z]+$';
    const result = intersectPattern(pattern, pattern);
    expect(result).toBe('(?=^[a-z]+$)(?=^[a-z]+$)');
  });

  test('empty string pattern', () => {
    const result = intersectPattern('', '^.+$');
    expect(result).toBe('^.+$');
  });

  test('patterns with special characters', () => {
    const result = intersectPattern('.*\\(test\\).*', '.*\\[bracket\\].*');
    expect(result).toBe('(?=.*\\(test\\).*)(?=.*\\[bracket\\].*)');
  });

  test('consecutive pattern combination', () => {
    const pattern1 = '^[a-z]+$';
    const pattern2 = '^.{5,}$';
    const pattern3 = '^.{0,10}$';

    const result1 = intersectPattern(pattern1, pattern2);
    const result2 = intersectPattern(result1, pattern3);

    expect(result2).toBe('(?=(?=^[a-z]+$)(?=^.{5,}$))(?=^.{0,10}$)');
  });

  test('unicode patterns', () => {
    const result = intersectPattern('[가-힣]+', '[0-9]+');
    expect(result).toBe('(?=[가-힣]+)(?=[0-9]+)');
  });
});
