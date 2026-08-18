import { describe, expect, it } from 'vitest';

import { stableEquals } from '../stableEquals';

describe('stableEquals 함수 테스트', () => {
  describe('stableEquals with omits option', () => {
    it('should return true if differences are only in omitted string keys', () => {
      const left = { a: 1, b: 2, c: 3 };
      const right = { a: 1, b: 99, c: 3 };
      expect(stableEquals(left, right, ['b'])).toBe(true);
    });

    it('should return false if differences exist in non-omitted string keys', () => {
      const left = { a: 1, b: 2, c: 3 };
      const right = { a: 1, b: 99, c: 100 };
      expect(stableEquals(left, right, ['b'])).toBe(false);
    });

    it('should handle multiple omitted string keys', () => {
      const left = { a: 1, b: 2, c: 3, d: 4 };
      const right = { a: 1, b: 99, c: 100, d: 4 };
      expect(stableEquals(left, right, ['b', 'c'])).toBe(true);
    });

    it('should return true if differences are only in omitted symbol keys', () => {
      const symB = Symbol('b');
      const symC = Symbol('c');
      const left = { a: 1, [symB]: 2, [symC]: 3 };
      const right = { a: 1, [symB]: 99, [symC]: 3 };
      expect(stableEquals(left, right, [symB])).toBe(true);
    });

    it('should return false if differences exist in non-omitted symbol keys', () => {
      const symB = Symbol('b');
      const symC = Symbol('c');
      const left = { a: 1, [symB]: 2, [symC]: 3 };
      const right = { a: 1, [symB]: 99, [symC]: 100 };
      expect(stableEquals(left, right, [symB])).toBe(false);
    });

    it('should handle mixed omitted string and symbol keys', () => {
      const symB = Symbol('b');
      const left = { a: 1, [symB]: 2, c: 3, d: 4 };
      const right = { a: 100, [symB]: 99, c: 3, d: 4 };
      expect(stableEquals(left, right, ['a', symB])).toBe(true);
    });

    it('should return false if omits option is not provided and values differ (string key)', () => {
      const left = { a: 1, b: 2, c: 3 };
      const right = { a: 1, b: 99, c: 3 };
      expect(stableEquals(left, right)).toBe(false);
    });

    it('should return false if omits option is not provided and values differ (symbol key)', () => {
      const symB = Symbol('b');
      const left = { a: 1, [symB]: 2 };
      const right = { a: 1, [symB]: 99 };
      expect(stableEquals(left, right)).toBe(false);
    });

    it('should return true for identical objects even with omits', () => {
      const symB = Symbol('b');
      const left = { a: 1, [symB]: 2 };
      const right = { a: 1, [symB]: 2 };
      expect(stableEquals(left, right, ['a', symB])).toBe(true);
    });

    it('should return true for empty omits array', () => {
      const left = { a: 1, b: 2 };
      const right = { a: 1, b: 99 };
      expect(stableEquals(left, right, [])).toBe(false);
    });
  });
});
