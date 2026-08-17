import { describe, expect, it } from 'vitest';

import { stableEquals } from '../stableEquals';

/**
 * stableEquals 가 놓치던 두 지점 — omit 이 적용되는 시점과, 내부 슬롯에 상태를 담는
 * 내장 객체(Map/Set/ArrayBuffer)의 비교. 일반 동작은 stableEquals.test.ts 담당
 * (43 케이스로 test-record 상한 초과 상태라 분할).
 */
describe('stableEquals contract', () => {
  describe('omit', () => {
    it('should treat asymmetric key sets as equal when the extra key is omitted', () => {
      expect(stableEquals({ a: 1, b: 2 }, { a: 1 }, ['b'])).toBe(true);
      expect(stableEquals({ a: 1 }, { a: 1, b: 2 }, ['b'])).toBe(true);
    });

    it('should reject asymmetric key sets when the extra key is not omitted', () => {
      expect(stableEquals({ a: 1, b: 2 }, { a: 1 }, ['c'])).toBe(false);
      expect(stableEquals({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    });
  });

  describe('built-in objects', () => {
    it('should compare Set and Map by size and contents', () => {
      expect(stableEquals(new Set([1, 2]), new Set([1, 2]))).toBe(true);
      expect(stableEquals(new Set([1, 2]), new Set([1, 3]))).toBe(false);
      expect(stableEquals(new Map([['a', 1]]), new Map([['a', 1]]))).toBe(true);
      expect(stableEquals(new Map([[1, 2]]), new Map())).toBe(false);
    });

    it('should compare ArrayBuffer by byte length and content', () => {
      expect(stableEquals(new ArrayBuffer(8), new ArrayBuffer(16))).toBe(false);
      expect(stableEquals(new ArrayBuffer(8), new ArrayBuffer(8))).toBe(true);
    });

    it('should not conflate a built-in with a plain object or another kind', () => {
      expect(stableEquals(new Date(), {})).toBe(false);
      expect(stableEquals({}, new Date())).toBe(false);
      expect(stableEquals(new Map(), new Set())).toBe(false);
    });

    it('should keep comparing Date and RegExp by state', () => {
      expect(stableEquals(new Date('2023-01-01'), new Date('2023-01-01'))).toBe(
        true,
      );
      expect(stableEquals(new Date('2023-01-01'), new Date('2024-06-15'))).toBe(
        false,
      );
      expect(stableEquals(/abc/g, /abc/g)).toBe(true);
      expect(stableEquals(/abc/g, /abc/i)).toBe(false);
    });
  });
});
