import { describe, expect, it } from 'vitest';

import {
  EMPTY_INTERSECTION,
  intersectConst,
  intersectEnum,
  intersectMaximum,
  intersectMinimum,
  intersectMultipleOf,
  validateRange,
} from '../index';

// filid:contract intersection-values
describe('schema leaf intersections', () => {
  it('retains the only enum declaration by reference', () => {
    const values = [1, 2];
    expect(intersectEnum(values)).toBe(values);
    expect(intersectEnum(undefined, values)).toBe(values);
    expect(intersectEnum()).toBeUndefined();
  });

  it('intersects enum values without changing either declaration', () => {
    const left = Object.freeze([1, 2, 3]);
    const right = Object.freeze([2, 3, 4]);
    expect(intersectEnum(left, right)).toEqual([2, 3]);
    expect(intersectEnum([1], [2])).toBe(EMPTY_INTERSECTION);
  });

  it('selects shallow or deep enum equality explicitly', () => {
    const value = { nested: [1, null] };
    expect(intersectEnum([value], [{ nested: [1, null] }])).toBe(
      EMPTY_INTERSECTION,
    );
    expect(intersectEnum([value], [{ nested: [1, null] }], true)).toEqual([
      value,
    ]);
  });

  it('retains deeply equal const declarations by their first reference', () => {
    const value = { nested: [1, { flag: true }, null] };
    expect(intersectConst(value, { nested: [1, { flag: true }, null] })).toBe(
      value,
    );
    const array = [1, 2];
    expect(intersectConst(array, [1, 2])).toBe(array);
  });

  it('handles absent, primitive and null const declarations', () => {
    expect(intersectConst()).toBeUndefined();
    expect(intersectConst(undefined, null)).toBeNull();
    expect(intersectConst(null, undefined)).toBeNull();
    expect(intersectConst(null, null)).toBeNull();
    expect(intersectConst(2, 2)).toBe(2);
    expect(intersectConst('a', 'b')).toBe(EMPTY_INTERSECTION);
    expect(intersectConst({ a: 1 }, { a: 2 })).toBe(EMPTY_INTERSECTION);
  });

  it('chooses the more restrictive lower bound', () => {
    expect(intersectMinimum(1, 2)).toBe(2);
    expect(intersectMinimum(undefined, 2)).toBe(2);
    expect(intersectMinimum(2)).toBe(2);
    expect(intersectMinimum()).toBeUndefined();
  });

  it('chooses the more restrictive upper bound', () => {
    expect(intersectMaximum(1, 2)).toBe(1);
    expect(intersectMaximum(undefined, 2)).toBe(2);
    expect(intersectMaximum(2)).toBe(2);
    expect(intersectMaximum()).toBeUndefined();
  });

  it('uses existing least-common-multiple and non-finite policies', () => {
    expect(intersectMultipleOf(2, 3)).toBe(6);
    expect(intersectMultipleOf(0.2, 0.3)).toBeCloseTo(0.6);
    expect(intersectMultipleOf(Infinity, 3)).toBe(3);
    expect(intersectMultipleOf(3, NaN)).toBe(3);
    expect(intersectMultipleOf()).toBeUndefined();
  });

  it('returns an empty marker only for reversed ranges', () => {
    expect(validateRange(2, 1)).toBe(EMPTY_INTERSECTION);
    expect(validateRange(1, 1)).toBeUndefined();
    expect(validateRange(1, 2)).toBeUndefined();
    expect(validateRange(undefined, 2)).toBeUndefined();
    expect(validateRange(1)).toBeUndefined();
  });
});
