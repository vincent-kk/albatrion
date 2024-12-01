import { describe, expect, it } from 'vitest';

import { isReactElement } from '../isReactElement';

describe('isReactElement', () => {
  it('should return true if the input is a react element', () => {
    expect(isReactElement(<div />)).toBe(true);
  });
  it('should return false if the input is not a react element', () => {
    expect(isReactElement({})).toBe(false);
    expect(isReactElement([])).toBe(false);
    expect(isReactElement('null')).toBe(false);
    expect(isReactElement(null)).toBe(false);
    expect(isReactElement(1)).toBe(false);
    expect(isReactElement(undefined)).toBe(false);
  });
});
