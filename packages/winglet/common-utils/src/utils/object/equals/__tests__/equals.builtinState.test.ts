import { describe, expect, it } from 'vitest';

import { equals } from '../equals';
import { stableEquals } from '../utils/stableEquals';

const bytes = (...values: number[]) => new Uint8Array(values).buffer;

/**
 * Built-ins whose state sits in internal slots or non-enumerable own properties:
 * an empty key list must never make two different states equal.
 */
describe('built-in state that own enumerable keys cannot see', () => {
  describe.each([
    ['equals', equals],
    ['stableEquals', stableEquals],
  ] as const)('%s', (_, compare) => {
    it('should compare ArrayBuffer bytes', () => {
      expect(compare(bytes(1, 2), bytes(1, 2))).toBe(true);
      expect(compare(bytes(1), bytes(2))).toBe(false);
      expect(compare(bytes(1), bytes(1, 0))).toBe(false);
    });

    it('should compare only the bytes a DataView covers', () => {
      const shared = bytes(9, 1, 2, 9);
      expect(
        compare(new DataView(shared, 1, 2), new DataView(bytes(1, 2))),
      ).toBe(true);
      expect(compare(new DataView(bytes(1)), new DataView(bytes(2)))).toBe(
        false,
      );
    });

    it('should compare the primitive value of boxed primitives', () => {
      expect(compare(new Number(1), new Number(1))).toBe(true);
      expect(compare(new Number(1), new Number(2))).toBe(false);
      expect(compare(new Number(NaN), new Number(NaN))).toBe(true);
      expect(compare(new Boolean(true), new Boolean(false))).toBe(false);
      expect(compare(new String('a'), new String('b'))).toBe(false);
      expect(compare(new String('ab'), new String('ab'))).toBe(true);
    });
  });

  describe('equals on errors', () => {
    it('should reject errors whose name or message differs', () => {
      expect(equals(new Error('a'), new Error('b'))).toBe(false);
      expect(equals(new TypeError('a'), new RangeError('a'))).toBe(false);
    });

    it('should accept errors with the same name, message and enumerable keys', () => {
      expect(equals(new Error('a'), new Error('a'))).toBe(true);
      expect(
        equals(
          Object.assign(new Error('a'), { code: 1 }),
          Object.assign(new Error('a'), { code: 2 }),
        ),
      ).toBe(false);
    });
  });
});
