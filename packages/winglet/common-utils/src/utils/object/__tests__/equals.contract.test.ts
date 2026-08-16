import { describe, expect, it } from 'vitest';

import { equals } from '../equals';

/**
 * equals 의 문서화된 계약 중 구현이 지키지 못하던 두 지점 — omit 이 적용되는 시점과
 * 내장 객체의 비교 방식. 일반 동작은 equals.test.ts 담당(상한에 근접해 분할).
 */
describe('equals contract', () => {
  describe('omit', () => {
    it('should treat asymmetric key sets as equal when the extra key is omitted', () => {
      expect(equals({ a: 1, b: 2 }, { a: 1 }, ['b'])).toBe(true);
      expect(equals({ a: 1 }, { a: 1, b: 2 }, ['b'])).toBe(true);
    });

    it('should reject asymmetric key sets when the extra key is not omitted', () => {
      expect(equals({ a: 1, b: 2 }, { a: 1 }, ['c'])).toBe(false);
      expect(equals({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    });

    it('should apply omit at every nesting level', () => {
      expect(
        equals({ outer: { a: 1, b: 2 } }, { outer: { a: 1 } }, ['b']),
      ).toBe(true);
    });
  });

  describe('built-in objects are compared by state', () => {
    it('should hold a built-in equal to itself', () => {
      const date = new Date('2023-01-01T00:00:00.000Z');
      const regex = /abc/g;
      const map = new Map([['a', 1]]);

      expect(equals(date, date)).toBe(true);
      expect(equals(regex, regex)).toBe(true);
      expect(equals(map, map)).toBe(true);
    });

    it('should compare Date by its time, including invalid dates', () => {
      expect(equals(new Date('2023-01-01'), new Date('2023-01-01'))).toBe(true);
      expect(equals(new Date('2023-01-01'), new Date('2024-06-15'))).toBe(
        false,
      );
      expect(equals(new Date('nonsense'), new Date('nonsense'))).toBe(true);
      expect(equals(new Date('nonsense'), new Date('2023-01-01'))).toBe(false);
    });

    it('should compare RegExp by source and flags', () => {
      expect(equals(/abc/g, /abc/g)).toBe(true);
      expect(equals(/abc/g, /abc/i)).toBe(false);
      expect(equals(/abc/g, /xyz/g)).toBe(false);
    });

    it('should compare Set and Map by size and contents', () => {
      expect(equals(new Set([1, 2]), new Set([1, 2]))).toBe(true);
      expect(equals(new Set([1, 2]), new Set([1, 3]))).toBe(false);
      expect(equals(new Set([1]), new Set([1, 2]))).toBe(false);
      expect(equals(new Map([['a', 1]]), new Map([['a', 1]]))).toBe(true);
      expect(equals(new Map([['a', 1]]), new Map([['a', 2]]))).toBe(false);
      expect(equals(new Map([['a', 1]]), new Map([['b', 1]]))).toBe(false);
    });

    it('should compare Map values recursively but match members by identity', () => {
      expect(
        equals(new Map([['a', { x: 1 }]]), new Map([['a', { x: 1 }]])),
      ).toBe(true);
      expect(
        equals(new Map([['a', { x: 1 }]]), new Map([['a', { x: 2 }]])),
      ).toBe(false);
      // 문서화된 한계: Set 멤버와 Map 키는 SameValueZero 로 매칭된다
      expect(equals(new Set([{ x: 1 }]), new Set([{ x: 1 }]))).toBe(false);
    });

    it('should not conflate different built-in kinds or a built-in with a plain object', () => {
      expect(equals(new Map([['a', 1]]), new Set())).toBe(false);
      expect(equals(new Date(), {})).toBe(false);
      expect(equals({}, new Date())).toBe(false);
    });

    it('should keep comparing class instances structurally', () => {
      class Point {
        constructor(
          public x: number,
          public y: number,
        ) {}
      }

      expect(equals(new Point(1, 2), new Point(1, 2))).toBe(true);
      expect(equals(new Point(1, 2), new Point(1, 3))).toBe(false);
    });
  });
});
