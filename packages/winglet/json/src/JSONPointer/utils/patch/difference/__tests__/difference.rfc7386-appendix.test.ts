import { describe, expect, it } from 'vitest';

import { difference } from '../difference';

describe('difference - RFC 7386 JSON Merge Patch 생성기', () => {
  describe('RFC 7386 Appendix A 표준 테스트 케이스', () => {
    it('속성 값 변경: {"a":"b"} -> {"a":"c"}', () => {
      const original = { a: 'b' };
      const target = { a: 'c' };
      const expectedPatch = { a: 'c' };

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('속성 값 변경: {"a/b/c":"b"} -> {"a/b/c":"c"}', () => {
      const original = { 'a/b/c': 'b' };
      const target = { 'a/b/c': 'c' };
      const expectedPatch = { 'a/b/c': 'c' };

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('새 속성 추가: {"a":"b"} -> {"a":"b","b":"c"}', () => {
      const original = { a: 'b' };
      const target = { a: 'b', b: 'c' };
      const expectedPatch = { b: 'c' };

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('속성 제거: {"a":"b"} -> {}', () => {
      const original = { a: 'b' };
      const target = {};
      const expectedPatch = { a: null };

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('여러 속성 중 하나만 제거: {"a":"b","b":"c"} -> {"b":"c"}', () => {
      const original = { a: 'b', b: 'c' };
      const target = { b: 'c' };
      const expectedPatch = { a: null };

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('배열을 문자열로 대체: {"a":["b"]} -> {"a":"c"}', () => {
      const original = { a: ['b'] };
      const target = { a: 'c' };
      const expectedPatch = { a: 'c' };

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('문자열을 배열로 대체: {"a":"c"} -> {"a":["b"]}', () => {
      const original = { a: 'c' };
      const target = { a: ['b'] };
      const expectedPatch = { a: ['b'] };

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('중첩 객체 병합 및 속성 제거: {"a":{"b":"c"}} -> {"a":{"b":"d"}}', () => {
      const original = { a: { b: 'c' } };
      const target = { a: { b: 'd' } };
      const expectedPatch = { a: { b: 'd' } };

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('중첩 객체에서 속성 제거: {"a":{"b":"c","c":"d"}} -> {"a":{"b":"d"}}', () => {
      const original = { a: { b: 'c', c: 'd' } };
      const target = { a: { b: 'd' } };
      const expectedPatch = { a: { b: 'd', c: null } };

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('객체 내 배열 완전 대체: {"a":[{"b":"c"}]} -> {"a":[1]}', () => {
      const original = { a: [{ b: 'c' }] };
      const target = { a: [1] };
      const expectedPatch = { a: [1] };

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('배열 완전 대체: ["a","b"] -> ["c","d"]', () => {
      const original = ['a', 'b'];
      const target = ['c', 'd'];
      const expectedPatch = ['c', 'd'];

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('객체를 배열로 대체: {"a":"b"} -> ["c"]', () => {
      const original = { a: 'b' };
      const target = ['c'];
      const expectedPatch = ['c'];

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('객체를 null로 대체: {"a":"foo"} -> null', () => {
      const original = { a: 'foo' };
      const target = null;
      const expectedPatch = null;

      expect(difference(original, target)).toBe(expectedPatch);
    });

    it('객체를 문자열로 대체: {"a":"foo"} -> "bar"', () => {
      const original = { a: 'foo' };
      const target = 'bar';
      const expectedPatch = 'bar';

      expect(difference(original, target)).toBe(expectedPatch);
    });

    it('기존 null 값은 유지하고 새 속성 추가: {"e":null} -> {"e":null,"a":1}', () => {
      const original = { e: null };
      const target = { e: null, a: 1 };
      const expectedPatch = { a: 1 };

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('배열에 객체 패치 적용: [1,2] -> {"a":"b"}', () => {
      const original = [1, 2];
      const target = { a: 'b' };
      const expectedPatch = { a: 'b' };

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('깊이 중첩된 객체에서 null 속성 제거: {} -> {"a":{"bb":{}}}', () => {
      const original = {};
      const target = { a: { bb: {} } };
      const expectedPatch = { a: { bb: {} } };

      expect(difference(original, target)).toEqual(expectedPatch);
    });
  });
});
