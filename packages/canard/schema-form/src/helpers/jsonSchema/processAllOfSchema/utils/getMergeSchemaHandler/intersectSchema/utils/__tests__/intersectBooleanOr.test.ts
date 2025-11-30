import { describe, expect, test } from 'vitest';

import { intersectBooleanOr } from '../intersectBooleanOr';

describe('intersectBooleanOr', () => {
  test('returns true if at least one is true', () => {
    expect(intersectBooleanOr(true, false)).toBe(true);
    expect(intersectBooleanOr(false, true)).toBe(true);
    expect(intersectBooleanOr(true, true)).toBe(true);
  });

  test('returns false when both are false', () => {
    expect(intersectBooleanOr(false, false)).toBe(false);
  });

  test('when only base exists', () => {
    expect(intersectBooleanOr(true, undefined)).toBe(true);
    expect(intersectBooleanOr(false, undefined)).toBe(false);
  });

  test('when only source exists', () => {
    expect(intersectBooleanOr(undefined, true)).toBe(true);
    expect(intersectBooleanOr(undefined, false)).toBe(false);
  });

  test('returns undefined when both are undefined', () => {
    expect(intersectBooleanOr(undefined, undefined)).toBeUndefined();
  });

  test('behaves same as OR operator', () => {
    // Same result as JavaScript || operator
    // eslint-disable-next-line no-constant-binary-expression
    expect(intersectBooleanOr(true, true)).toBe(true || true);
    // eslint-disable-next-line no-constant-binary-expression
    expect(intersectBooleanOr(true, false)).toBe(true || false);
    // eslint-disable-next-line no-constant-binary-expression
    expect(intersectBooleanOr(false, true)).toBe(false || true);
    // eslint-disable-next-line no-constant-binary-expression
    expect(intersectBooleanOr(false, false)).toBe(false || false);
  });

  test('all possible combinations', () => {
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
