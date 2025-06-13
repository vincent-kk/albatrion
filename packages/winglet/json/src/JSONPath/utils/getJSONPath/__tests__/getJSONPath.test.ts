import { describe, expect, it } from 'vitest';

import { getJSONPath } from '../getJSONPath';

describe('getJSONPath', () => {
  describe('기본 동작', () => {
    it('루트 객체 자체를 타겟으로 하면 "$"를 반환해야 함', () => {
      const obj = { a: 1 };
      expect(getJSONPath(obj, obj)).toBe('$');
    });

    it('존재하지 않는 타겟에 대해 null을 반환해야 함', () => {
      const obj = { a: 1 };
      const target = { b: 2 };
      expect(getJSONPath(obj, target)).toBe(null);
    });
  });

  describe('객체 속성 경로', () => {
    it('단순 객체 속성에 대한 경로를 반환해야 함', () => {
      const obj = { a: { value: 'test' } };
      expect(getJSONPath(obj, obj.a)).toBe('$.a');
    });

    it('중첩된 객체 속성에 대한 경로를 반환해야 함', () => {
      const obj = { a: { b: { c: { value: 'test' } } } };
      expect(getJSONPath(obj, obj.a.b.c)).toBe('$.a.b.c');
    });

    it('점을 포함하는 키는 bracket notation을 사용해야 함', () => {
      const obj = { 'key.with.dots': { value: 'test' } };
      expect(getJSONPath(obj, obj['key.with.dots'])).toBe("$['key.with.dots']");
    });

    it('점을 포함하는 중첩 키에 대한 경로를 반환해야 함', () => {
      const obj = { 'parent.key': { 'child.key': { value: 'test' } } };
      expect(getJSONPath(obj, obj['parent.key']['child.key'])).toBe(
        "$['parent.key']['child.key']",
      );
    });

    it('일반 키와 점을 포함하는 키가 혼재된 경로를 처리해야 함', () => {
      const obj = {
        normal: { 'key.with.dots': { regular: { value: 'test' } } },
      };
      expect(getJSONPath(obj, obj.normal['key.with.dots'].regular)).toBe(
        "$.normal['key.with.dots'].regular",
      );
    });
  });

  describe('배열 인덱스 경로', () => {
    it('배열 요소에 대한 경로를 반환해야 함', () => {
      const obj = { arr: [1, 2, 3] };
      expect(getJSONPath(obj, obj.arr[1])).toBe('$.arr[1]');
    });

    it('중첩된 배열 요소에 대한 경로를 반환해야 함', () => {
      const obj = {
        arr: [
          [1, 2],
          [3, 4],
        ],
      };
      expect(getJSONPath(obj, obj.arr[1][0])).toBe('$.arr[1][0]');
    });

    it('배열 내 객체에 대한 경로를 반환해야 함', () => {
      const obj = { arr: [{ name: 'first' }, { name: 'second' }] };
      expect(getJSONPath(obj, obj.arr[1])).toBe('$.arr[1]');
    });

    it('배열 내 객체의 속성에 대한 경로를 반환해야 함', () => {
      const obj = { arr: [{ name: 'first' }, { name: 'second' }] };
      expect(getJSONPath(obj, obj.arr[1].name)).toBe('$.arr[1].name');
    });
  });

  describe('복합 구조', () => {
    it('객체와 배열이 혼재된 복잡한 구조를 처리해야 함', () => {
      const obj = {
        data: {
          items: [
            { id: 1, tags: ['a', 'b'] },
            { id: 2, tags: ['c', 'd'] },
          ],
        },
      };
      expect(getJSONPath(obj, obj.data.items[1].tags[0])).toBe(
        '$.data.items[1].tags[0]',
      );
    });

    it('점을 포함하는 키와 배열이 혼재된 구조를 처리해야 함', () => {
      const obj = {
        'config.prod': {
          servers: [{ 'host.name': 'server1' }, { 'host.name': 'server2' }],
        },
      };
      expect(getJSONPath(obj, obj['config.prod'].servers[1]['host.name'])).toBe(
        "$['config.prod'].servers[1]['host.name']",
      );
    });
  });

  describe('특수 케이스', () => {
    it('빈 객체를 처리해야 함', () => {
      const obj = {};
      expect(getJSONPath(obj, obj)).toBe('$');
    });

    it('빈 배열을 처리해야 함', () => {
      const obj = { arr: [] };
      expect(getJSONPath(obj, obj.arr)).toBe('$.arr');
    });

    it('null 값을 포함하는 구조를 처리해야 함', () => {
      const obj = { data: null };
      expect(getJSONPath(obj, obj.data)).toBe('$.data');
    });

    it('undefined 값을 포함하는 구조를 처리해야 함', () => {
      const obj = { data: undefined };
      expect(getJSONPath(obj, obj.data)).toBe('$.data');
    });

    it('숫자 키를 가진 객체를 처리해야 함', () => {
      const obj = { '0': 'zero', '1': 'one' };
      expect(getJSONPath(obj, obj['0'])).toBe('$.0');
      expect(getJSONPath(obj, obj['1'])).toBe('$.1');
    });
  });

  describe('깊은 중첩 구조', () => {
    it('매우 깊은 중첩 객체를 처리해야 함', () => {
      const deep = { a: { b: { c: { d: { e: { f: { value: 'deep' } } } } } } };
      expect(getJSONPath(deep, deep.a.b.c.d.e.f)).toBe('$.a.b.c.d.e.f');
    });

    it('깊은 배열 중첩을 처리해야 함', () => {
      const deep = { arr: [[[[[['deep']]]]]] };
      expect(getJSONPath(deep, deep.arr[0][0][0][0][0][0])).toBe(
        '$.arr[0][0][0][0][0][0]',
      );
    });
  });

  describe('동일한 값을 가진 여러 경로', () => {
    it('동일한 원시값이 여러 위치에 있는 경우 첫 번째 경로를 반환해야 함', () => {
      const obj = { a: 'same', b: { c: 'same' } };
      const target = 'same';
      // DFS 순서에 따라 첫 번째로 발견되는 경로를 반환
      const result = getJSONPath(obj, target);
      expect(['$.a', '$.b.c']).toContain(result);
    });

    it('동일한 객체 참조가 여러 위치에 있는 경우를 처리해야 함', () => {
      const shared = { value: 'shared' };
      const obj = { a: shared, b: { c: shared } };
      // 첫 번째 참조의 경로를 반환해야 함
      expect(getJSONPath(obj, shared)).toBe('$.a');
    });
  });
});
