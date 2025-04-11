import { describe, expect, it } from 'vitest';

import { isDate } from '../isDate';

describe('isDate', () => {
  it('should return true for Date instances', () => {
    expect(isDate(new Date())).toBe(true);
    expect(isDate(new Date('2024-01-01'))).toBe(true);
    expect(isDate(new Date(1704067200000))).toBe(true);
  });

  it('should return false for non-Date values', () => {
    expect(isDate(null)).toBe(false);
    expect(isDate(undefined)).toBe(false);
    expect(isDate(42)).toBe(false);
    expect(isDate('2024-01-01')).toBe(false);
    expect(isDate({})).toBe(false);
    expect(isDate([])).toBe(false);
    expect(isDate(new RegExp('test'))).toBe(false);
  });

  it('should return true for invalid Date instances, isDate is not check invalid date', () => {
    expect(isDate(new Date('invalid'))).toBe(true);
    expect(isDate(new Date('2024-13-45'))).toBe(true);
  });
});
