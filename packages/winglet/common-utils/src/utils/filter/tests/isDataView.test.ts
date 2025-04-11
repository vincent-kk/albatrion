import { describe, expect, it } from 'vitest';

import { isDataView } from '../isDataView';

describe('isDataView', () => {
  it('should return true for DataView instances', () => {
    const buffer = new ArrayBuffer(8);
    const dataView = new DataView(buffer);
    expect(isDataView(dataView)).toBe(true);
  });

  it('should return false for non-DataView values', () => {
    expect(isDataView(null)).toBe(false);
    expect(isDataView(undefined)).toBe(false);
    expect(isDataView(42)).toBe(false);
    expect(isDataView('string')).toBe(false);
    expect(isDataView({})).toBe(false);
    expect(isDataView([])).toBe(false);
    expect(isDataView(new ArrayBuffer(8))).toBe(false);
    expect(isDataView(new Blob())).toBe(false);
  });
});
