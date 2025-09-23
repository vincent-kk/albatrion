import { describe, expect, test } from 'vitest';

import { intersectPattern } from '../intersectPattern';

describe('intersectPattern', () => {
  test('두 패턴을 AND로 결합', () => {
    const result = intersectPattern('^[a-z]+$', '^.{5,}$');
    expect(result).toBe('(?=^[a-z]+$)(?=^.{5,}$)');
  });

  test('복잡한 패턴들', () => {
    const result = intersectPattern('[A-Z][a-z]+', '\\d{3}');
    expect(result).toBe('(?=[A-Z][a-z]+)(?=\\d{3})');
  });

  test('base만 있으면 그 값 반환', () => {
    const result = intersectPattern('^[a-z]+$', undefined);
    expect(result).toBe('^[a-z]+$');
  });

  test('source만 있으면 그 값 반환', () => {
    const result = intersectPattern(undefined, '^.{5,}$');
    expect(result).toBe('^.{5,}$');
  });

  test('둘 다 없으면 undefined', () => {
    const result = intersectPattern(undefined, undefined);
    expect(result).toBeUndefined();
  });

  test('같은 패턴인 경우', () => {
    const pattern = '^[a-z]+$';
    const result = intersectPattern(pattern, pattern);
    expect(result).toBe('(?=^[a-z]+$)(?=^[a-z]+$)');
  });

  test('빈 문자열 패턴', () => {
    const result = intersectPattern('', '^.+$');
    expect(result).toBe('^.+$');
  });

  test('특수 문자가 포함된 패턴', () => {
    const result = intersectPattern('.*\\(test\\).*', '.*\\[bracket\\].*');
    expect(result).toBe('(?=.*\\(test\\).*)(?=.*\\[bracket\\].*)');
  });

  test('연속적인 패턴 결합', () => {
    const pattern1 = '^[a-z]+$';
    const pattern2 = '^.{5,}$';
    const pattern3 = '^.{0,10}$';

    const result1 = intersectPattern(pattern1, pattern2);
    const result2 = intersectPattern(result1, pattern3);

    expect(result2).toBe('(?=(?=^[a-z]+$)(?=^.{5,}$))(?=^.{0,10}$)');
  });

  test('유니코드 패턴', () => {
    const result = intersectPattern('[가-힣]+', '[0-9]+');
    expect(result).toBe('(?=[가-힣]+)(?=[0-9]+)');
  });
});
