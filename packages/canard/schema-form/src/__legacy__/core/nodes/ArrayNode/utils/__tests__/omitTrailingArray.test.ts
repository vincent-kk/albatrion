import { describe, expect, it } from 'vitest';

import { omitTrailingArray } from '../omitTrailingArray';

describe('omitTrailingArray', () => {
  it('should remove consecutive trailing undefined items', () => {
    expect(omitTrailingArray([1, 2, 3, undefined, undefined])).toEqual([
      1, 2, 3,
    ]);
  });

  it('should return the same reference when there is no trailing undefined', () => {
    const value = [1, 2, 3];
    expect(omitTrailingArray(value)).toBe(value);
  });

  it('should preserve leading undefined items', () => {
    const value = [undefined, 1, 2];
    expect(omitTrailingArray(value)).toBe(value);
  });

  it('should preserve middle undefined items', () => {
    const value = [1, undefined, 2];
    expect(omitTrailingArray(value)).toBe(value);
  });

  it('should remove only the trailing run, keeping middle undefined items', () => {
    expect(omitTrailingArray([1, undefined, 2, undefined, undefined])).toEqual([
      1,
      undefined,
      2,
    ]);
  });

  it('should return an empty array when all items are undefined', () => {
    expect(omitTrailingArray([undefined, undefined])).toEqual([]);
  });

  it('should return an empty array for a single undefined item', () => {
    expect(omitTrailingArray([undefined])).toEqual([]);
  });

  it('should return the same reference for an empty array', () => {
    const value: unknown[] = [];
    expect(omitTrailingArray(value)).toBe(value);
  });

  it('should pass through nullish input unchanged', () => {
    expect(omitTrailingArray(undefined)).toBeUndefined();
    expect(omitTrailingArray(null)).toBeNull();
  });

  it('should not remove trailing null items', () => {
    const value = [1, null, null];
    expect(omitTrailingArray(value)).toBe(value);
  });

  it('should not mutate the input array', () => {
    const value = [1, 2, undefined];
    omitTrailingArray(value);
    expect(value).toEqual([1, 2, undefined]);
    expect(value.length).toBe(3);
  });
});
