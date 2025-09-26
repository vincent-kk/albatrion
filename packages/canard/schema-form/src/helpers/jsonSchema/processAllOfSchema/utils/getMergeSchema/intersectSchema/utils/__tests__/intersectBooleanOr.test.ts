import { describe, expect, test } from 'vitest';

import { intersectBooleanOr } from '../intersectBooleanOr';

describe('intersectBooleanOr', () => {
  test('하나라도 true면 true', () => {
    expect(intersectBooleanOr(true, false)).toBe(true);
    expect(intersectBooleanOr(false, true)).toBe(true);
    expect(intersectBooleanOr(true, true)).toBe(true);
  });

  test('둘 다 false면 false', () => {
    expect(intersectBooleanOr(false, false)).toBe(false);
  });

  test('base만 있는 경우', () => {
    expect(intersectBooleanOr(true, undefined)).toBe(true);
    expect(intersectBooleanOr(false, undefined)).toBe(false);
  });

  test('source만 있는 경우', () => {
    expect(intersectBooleanOr(undefined, true)).toBe(true);
    expect(intersectBooleanOr(undefined, false)).toBe(false);
  });

  test('둘 다 없으면 undefined', () => {
    expect(intersectBooleanOr(undefined, undefined)).toBeUndefined();
  });

  test('OR 연산자와 동일한 동작', () => {
    // JavaScript의 || 연산자와 동일한 결과
    // eslint-disable-next-line no-constant-binary-expression
    expect(intersectBooleanOr(true, true)).toBe(true || true);
    // eslint-disable-next-line no-constant-binary-expression
    expect(intersectBooleanOr(true, false)).toBe(true || false);
    // eslint-disable-next-line no-constant-binary-expression
    expect(intersectBooleanOr(false, true)).toBe(false || true);
    // eslint-disable-next-line no-constant-binary-expression
    expect(intersectBooleanOr(false, false)).toBe(false || false);
  });

  test('모든 가능한 조합', () => {
    const combinations = [
      [true, true, true],
      [true, false, true],
      [false, true, true],
      [false, false, false],
      [true, undefined, true],
      [false, undefined, false],
      [undefined, true, true],
      [undefined, false, false],
      [undefined, undefined, undefined],
    ] as const;

    combinations.forEach(([base, source, expected]) => {
      expect(intersectBooleanOr(base, source)).toBe(expected);
    });
  });
});
