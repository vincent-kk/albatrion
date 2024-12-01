import { describe, expect, it } from 'vitest';

import { isFunction } from '../isFunction';

describe('isFunction', () => {
  it('should return true if the input is a function', () => {
    expect(isFunction(() => {})).toBe(true);
  });
  it('should return false if the input is not a function', () => {
    expect(isFunction(1)).toBe(false);
    expect(isFunction({})).toBe(false);
    expect(isFunction([])).toBe(false);
  });
});
