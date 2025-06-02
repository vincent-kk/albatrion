import { describe, expect, it } from 'vitest';

import { difference } from '../difference';

describe('difference - RFC 7386 JSON Merge Patch 생성기', () => {
  describe('기본 원리: difference(original, target) -> patch', () => {
    it('동일한 값인 경우 undefined를 반환해야 합니다', () => {
      expect(difference({ a: 1 }, { a: 1 })).toBeUndefined();
      expect(difference('hello', 'hello')).toBeUndefined();
      expect(difference(null, null)).toBeUndefined();
      expect(difference(42, 42)).toBeUndefined();
      expect(difference(true, true)).toBeUndefined();
      expect(difference([1, 2], [1, 2])).toBeUndefined();
    });

    it('빈 객체에서 빈 객체로 변경시 undefined를 반환해야 합니다', () => {
      expect(difference({}, {})).toBeUndefined();
    });
  });

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

  describe('중첩 객체 처리', () => {
    it('깊은 중첩에서 부분 변경', () => {
      const original = {
        user: {
          name: 'Vincent',
          profile: {
            age: 30,
            city: 'Seoul',
          },
        },
      };
      const target = {
        user: {
          name: 'Vincent',
          profile: {
            age: 31,
            city: 'Seoul',
          },
        },
      };
      const expectedPatch = {
        user: {
          profile: {
            age: 31,
          },
        },
      };

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('중첩 객체에 새 속성 추가', () => {
      const original = {
        user: {
          name: 'Vincent',
        },
      };
      const target = {
        user: {
          name: 'Vincent',
          profile: {
            age: 30,
          },
        },
      };
      const expectedPatch = {
        user: {
          profile: {
            age: 30,
          },
        },
      };

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('중첩 객체 전체 제거', () => {
      const original = {
        user: {
          name: 'Vincent',
          profile: {
            age: 30,
          },
        },
      };
      const target = {
        user: {
          name: 'Vincent',
        },
      };
      const expectedPatch = {
        user: {
          profile: null,
        },
      };

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('중첩 객체를 다른 타입으로 대체', () => {
      const original = {
        data: {
          nested: { value: 1 },
        },
      };
      const target = {
        data: 'replaced',
      };
      const expectedPatch = {
        data: 'replaced',
      };

      expect(difference(original, target)).toEqual(expectedPatch);
    });
  });

  describe('배열 처리', () => {
    it('배열 속성 완전 대체', () => {
      const original = {
        tags: ['old1', 'old2'],
        meta: { count: 2 },
      };
      const target = {
        tags: ['new1', 'new2', 'new3'],
        meta: { count: 2 },
      };
      const expectedPatch = {
        tags: ['new1', 'new2', 'new3'],
      };

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('배열을 다른 타입으로 대체', () => {
      const original = { items: [1, 2, 3] };
      const target = { items: 'no items' };
      const expectedPatch = { items: 'no items' };

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('다른 타입을 배열로 대체', () => {
      const original = { items: 'no items' };
      const target = { items: [1, 2, 3] };
      const expectedPatch = { items: [1, 2, 3] };

      expect(difference(original, target)).toEqual(expectedPatch);
    });
  });

  describe('특수 값 처리', () => {
    it('null 값 추가', () => {
      const original = { a: 'value' };
      const target = { a: 'value', b: null };
      const expectedPatch = { b: null };

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('null 값 변경', () => {
      const original = { a: null };
      const target = { a: 'value' };
      const expectedPatch = { a: 'value' };

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('falsy 값들 처리', () => {
      const original = { a: 'truthy', b: 'truthy', c: 'truthy' };
      const target = { a: 0, b: false, c: '' };
      const expectedPatch = { a: 0, b: false, c: '' };

      expect(difference(original, target)).toEqual(expectedPatch);
    });
  });

  describe('복잡한 시나리오', () => {
    it('복합적인 변경 사항', () => {
      const original = {
        users: [
          { name: 'Vincent', age: 30 },
          { name: 'John', age: 25 },
        ],
        meta: {
          total: 2,
          lastUpdated: '2024-01-01',
        },
        settings: {
          theme: 'dark',
          notifications: true,
        },
      };
      const target = {
        users: [{ name: 'Vincent', age: 31 }], // 완전 대체
        meta: {
          total: 1,
          lastUpdated: '2024-01-01',
        },
        // settings 제거됨
      };
      const expectedPatch = {
        users: [{ name: 'Vincent', age: 31 }],
        meta: {
          total: 1,
        },
        settings: null,
      };

      expect(difference(original, target)).toEqual(expectedPatch);
    });

    it('매우 깊은 중첩에서의 변경', () => {
      const original = {
        level1: {
          level2: {
            level3: {
              level4: {
                value: 'old',
                keep: 'unchanged',
              },
            },
          },
        },
      };
      const target = {
        level1: {
          level2: {
            level3: {
              level4: {
                value: 'new',
                keep: 'unchanged',
              },
            },
          },
        },
      };
      const expectedPatch = {
        level1: {
          level2: {
            level3: {
              level4: {
                value: 'new',
              },
            },
          },
        },
      };

      expect(difference(original, target)).toEqual(expectedPatch);
    });
  });

  describe('빈 패치 최적화', () => {
    it('변경사항이 없으면 undefined를 반환해야 합니다', () => {
      const original = { a: 1, b: { c: 2 } };
      const target = { a: 1, b: { c: 2 } };

      expect(difference(original, target)).toBeUndefined();
    });

    it('중첩 객체에서 변경사항이 없으면 undefined를 반환해야 합니다', () => {
      const original = {
        user: {
          name: 'Vincent',
          settings: {
            theme: 'dark',
          },
        },
      };
      const target = {
        user: {
          name: 'Vincent',
          settings: {
            theme: 'dark',
          },
        },
      };

      expect(difference(original, target)).toBeUndefined();
    });
  });

  describe('Primitive 타입 간 변환', () => {
    it('문자열 간 변경', () => {
      expect(difference('old', 'new')).toBe('new');
    });

    it('숫자 간 변경', () => {
      expect(difference(1, 2)).toBe(2);
    });

    it('불린 값 변경', () => {
      expect(difference(true, false)).toBe(false);
    });

    it('타입 간 변환', () => {
      expect(difference('string', 42)).toBe(42);
      expect(difference(42, 'string')).toBe('string');
      expect(difference(true, null)).toBe(null);
      expect(difference(null, 'value')).toBe('value');
    });
  });
});
