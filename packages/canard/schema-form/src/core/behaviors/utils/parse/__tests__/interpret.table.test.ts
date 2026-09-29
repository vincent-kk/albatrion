import { describe, expect, it } from 'vitest';

import type { UnionSpec } from '../../../../record';
import { convert, interpret, isMember } from '../index';

/** Build a scalar or union restriction without changing its kind identity. */
const spec = (kinds: UnionSpec['kinds'], nullable = false): UnionSpec => ({
  kinds,
  mask: 0,
  nullable,
});

describe('parse conversion table', () => {
  it('recognizes JSON type members and keeps null separate', () => {
    expect(isMember(4, 'number')).toBe(true);
    expect(isMember(Infinity, 'number')).toBe(false);
    expect(isMember(4, 'integer')).toBe(true);
    expect(isMember(4.2, 'integer')).toBe(false);
    expect(isMember({}, 'object')).toBe(true);
    expect(isMember([], 'object')).toBe(false);
    expect(isMember([], 'array')).toBe(true);
    expect(isMember(null, 'object')).toBe(false);
  });

  it('converts the complete permitted scalar table', () => {
    expect(convert(' 42 ', 'number')).toBe(42);
    expect(convert('4.2', 'number')).toBe(4.2);
    expect(convert('1e2', 'number')).toBe(100);
    expect(convert('1.0', 'integer')).toBe(1);
    expect(convert(12.5, 'string')).toBe('12.5');
    expect(convert(false, 'string')).toBe('false');
    expect(convert('true', 'boolean')).toBe(true);
    expect(convert('false', 'boolean')).toBe(false);
    expect(convert(1, 'boolean')).toBe(true);
    expect(convert(-0, 'boolean')).toBe(false);
  });

  it('preserves every unconvertible input, including TEST-077 values', () => {
    const object = { nested: 1 };
    const array = [1];
    for (const value of ['', '01', '1e400', '9007199254740993']) {
      expect(convert(value, 'number')).toBe(value);
    }
    for (const value of ['1.5', '1e16', '9007199254740993']) {
      expect(convert(value, 'integer')).toBe(value);
    }
    for (const value of ['True', ' true', '1', 2, NaN, Infinity]) {
      expect(convert(value, 'boolean')).toBe(value);
    }
    expect(convert(object, 'string')).toBe(object);
    expect(convert(array, 'object')).toBe(array);
    expect(convert(null, 'number')).toBeNull();
    expect(convert(10n, 'number')).toBe(10n);
    const revocable = Proxy.revocable({}, {});
    revocable.revoke();
    expect(isMember(revocable.proxy, 'array')).toBe(false);
    expect(interpret(revocable.proxy, spec('object'))).toBe(revocable.proxy);
  });

  it('keeps absence, null, existing members, and ambiguous conversions', () => {
    const kinds = ['string', 'boolean'] as const;
    expect(interpret(undefined, spec(kinds))).toBeUndefined();
    expect(interpret(null, spec(kinds))).toBeNull();
    expect(interpret('true', spec(kinds))).toBe('true');
    expect(interpret(0, spec(kinds))).toBe(0);
    expect(interpret(-0, spec(kinds))).toBe(-0);
    expect(interpret(1, spec(kinds))).toBe(1);
    expect(interpret('42', spec(['number', 'integer']))).toBe(42);
    expect(interpret('false', spec('boolean'))).toBe(false);
  });
});
