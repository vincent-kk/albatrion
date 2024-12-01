import { describe, expect, it } from 'vitest';

import { removeUndefined } from '../removeUndefined';

describe('removeUndefined', () => {
  it('should remove undefined properties from the object', () => {
    expect(removeUndefined({ a: 1, b: undefined })).toEqual({ a: 1 });
  });
  it('should remove undefined properties from the nested object', () => {
    expect(removeUndefined({ a: 1, b: { c: undefined } })).toEqual({
      a: 1,
      b: {},
    });
  });
  it('should return the same object if no undefined properties are present', () => {
    expect(removeUndefined({ a: 1, b: 2 })).toEqual({ a: 1, b: 2 });
  });
});
