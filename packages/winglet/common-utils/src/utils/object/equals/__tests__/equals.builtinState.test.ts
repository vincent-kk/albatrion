import { describe, expect, it } from 'vitest';

import { equals } from '../equals';
import { stableEquals } from '../utils/stableEquals';

const bytes = (...values: number[]) => new Uint8Array(values).buffer;

const policies = [
  ['equals', equals],
  ['stableEquals', stableEquals],
] as const;

/** A boxed number carrying an own field next to its primitive value. */
class Money extends Number {
  constructor(
    value: number,
    readonly currency: string,
  ) {
    super(value);
  }
}

/**
 * Built-ins whose state sits in internal slots or non-enumerable own properties:
 * an empty key list must never make two different states equal.
 */
describe('built-in state that own enumerable keys cannot see', () => {
  describe('equals', () => {
    it('should compare ArrayBuffer bytes', () => {
      expect(equals(bytes(1, 2), bytes(1, 2))).toBe(true);
      expect(equals(bytes(1), bytes(2))).toBe(false);
      expect(equals(bytes(1), bytes(1, 0))).toBe(false);
    });

    it('should compare only the bytes a DataView covers', () => {
      const shared = bytes(9, 1, 2, 9);
      expect(
        equals(new DataView(shared, 1, 2), new DataView(bytes(1, 2))),
      ).toBe(true);
      expect(equals(new DataView(bytes(1)), new DataView(bytes(2)))).toBe(
        false,
      );
    });

    it('should reject errors whose name or message differs', () => {
      expect(equals(new Error('a'), new Error('b'))).toBe(false);
      expect(equals(new TypeError('a'), new RangeError('a'))).toBe(false);
    });
  });

  describe.each(policies)('%s', (_, compare) => {
    it('should compare the primitive value of boxed primitives', () => {
      expect(compare(new Number(1), new Number(1))).toBe(true);
      expect(compare(new Number(1), new Number(2))).toBe(false);
      expect(compare(new Number(NaN), new Number(NaN))).toBe(true);
      expect(compare(new Boolean(true), new Boolean(false))).toBe(false);
      expect(compare(new String('a'), new String('b'))).toBe(false);
      expect(compare(new String('ab'), new String('ab'))).toBe(true);
    });
  });
});

/** Matching internal state must not hide own properties that differ. */
describe('own properties beside matching built-in state', () => {
  describe.each(policies)('%s', (_, compare) => {
    it('should compare own fields of boxed primitives with the same value', () => {
      expect(
        compare(
          Object.assign(new Number(1), { extra: 1 }),
          Object.assign(new Number(1), { extra: 2 }),
        ),
      ).toBe(false);
    });

    it('should compare own fields of boxed primitive subclasses', () => {
      expect(compare(new Money(1, 'KRW'), new Money(1, 'USD'))).toBe(false);
      expect(compare(new Money(1, 'KRW'), new Money(1, 'KRW'))).toBe(true);
    });

    it('should compare own fields of ArrayBuffers with the same bytes', () => {
      expect(
        compare(
          Object.assign(bytes(1), { label: 'a' }),
          Object.assign(bytes(1), { label: 'b' }),
        ),
      ).toBe(false);
    });
  });
});

/**
 * Controls: behavior these policies already had before the built-in state rules, kept
 * to show that the rules do not disturb it.
 */
describe('controls', () => {
  it('stableEquals compares ArrayBuffer bytes', () => {
    expect(stableEquals(bytes(1, 2), bytes(1, 2))).toBe(true);
    expect(stableEquals(bytes(1), bytes(2))).toBe(false);
    expect(stableEquals(bytes(1), bytes(1, 0))).toBe(false);
  });

  it('stableEquals compares only the bytes a DataView covers', () => {
    const shared = bytes(9, 1, 2, 9);
    expect(
      stableEquals(new DataView(shared, 1, 2), new DataView(bytes(1, 2))),
    ).toBe(true);
    expect(stableEquals(new DataView(bytes(1)), new DataView(bytes(2)))).toBe(
      false,
    );
  });

  it('equals accepts errors with the same name, message and enumerable keys', () => {
    expect(equals(new Error('a'), new Error('a'))).toBe(true);
    expect(
      equals(
        Object.assign(new Error('a'), { code: 1 }),
        Object.assign(new Error('a'), { code: 2 }),
      ),
    ).toBe(false);
  });
});
