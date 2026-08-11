import { describe, expect, it } from 'vitest';

import { resolveArrayValueFilter } from '../resolveArrayValueFilter';

describe('resolveArrayValueFilter', () => {
  it('should apply only omitEmpty by default (no options)', () => {
    const filter = resolveArrayValueFilter(undefined);
    expect(filter([])).toBeUndefined();
    const untrimmed = [1, undefined];
    expect(filter(untrimmed)).toBe(untrimmed);
  });

  it('should behave like the default for an empty options object', () => {
    const filter = resolveArrayValueFilter({});
    expect(filter([])).toBeUndefined();
    const untrimmed = [1, undefined];
    expect(filter(untrimmed)).toBe(untrimmed);
  });

  it('should chain omitTrailing into omitEmpty when omitTrailing is true', () => {
    const filter = resolveArrayValueFilter({ omitTrailing: true });
    expect(filter([1, undefined, undefined])).toEqual([1]);
    expect(filter([undefined, undefined])).toBeUndefined();
  });

  it('should keep the emptied array when omitEmpty is disabled', () => {
    const filter = resolveArrayValueFilter({
      omitTrailing: true,
      omitEmpty: false,
    });
    expect(filter([undefined, undefined])).toEqual([]);
    expect(filter([1, undefined])).toEqual([1]);
  });

  it('should return identity behavior when both options are disabled', () => {
    const filter = resolveArrayValueFilter({ omitEmpty: false });
    const empty: unknown[] = [];
    expect(filter(empty)).toBe(empty);
    const untrimmed = [1, undefined];
    expect(filter(untrimmed)).toBe(untrimmed);
  });

  it('should preserve middle undefined items when trimming', () => {
    const filter = resolveArrayValueFilter({ omitTrailing: true });
    const value = [1, undefined, 2];
    expect(filter(value)).toBe(value);
  });
});
