import { describe, expect, it } from 'vitest';

import { isForbiddenKey } from '../isForbiddenKey';

describe('isForbiddenKey', () => {
  it('should return true for forbidden keys', () => {
    expect(isForbiddenKey('__proto__')).toBe(true);
    expect(isForbiddenKey('prototype')).toBe(true);
    expect(isForbiddenKey('constructor')).toBe(true);
  });

  it('should return false for normal keys', () => {
    expect(isForbiddenKey('normal')).toBe(false);
    expect(isForbiddenKey('_proto_')).toBe(false);
    expect(isForbiddenKey('__proto')).toBe(false);
    expect(isForbiddenKey('proto__')).toBe(false);
    expect(isForbiddenKey('')).toBe(false);
  });

  it('should be case sensitive', () => {
    expect(isForbiddenKey('Prototype')).toBe(false);
    expect(isForbiddenKey('CONSTRUCTOR')).toBe(false);
    expect(isForbiddenKey('__PROTO__')).toBe(false);
  });
});
