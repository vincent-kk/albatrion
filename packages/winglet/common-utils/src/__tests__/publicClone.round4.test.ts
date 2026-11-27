import { describe, expect, it } from 'vitest';

import { clone } from '../index';
import { equals } from '../index';
import { stableEquals } from '../index';

describe('clone keeps an Error cause as it was', () => {
  it('equals(error, clone(error)) is true for a local Error with a cause', () => {
    const error = Object.defineProperty(new Error('failed'), 'cause', {
      value: { code: 7 },
      configurable: true,
      writable: true,
    });
    expect(equals(error, clone(error))).toBe(true);
  });

  it('control: stableEquals(error, clone(error)) is true', () => {
    const error = Object.defineProperty(new Error('failed'), 'cause', {
      value: { code: 7 },
      configurable: true,
      writable: true,
    });
    expect(stableEquals(error, clone(error))).toBe(true);
  });
});
