import { describe, expect, it } from 'vitest';

import { serializeNative } from '../serializeNative';
import { sortObjectKeys } from '../sortObjectKeys';

describe('sortObjectKeys', () => {
  const testCases = [
    {
      name: '기본 객체 정렬',
      input: { c: 3, a: 1, b: 2 },
      keys: ['a', 'b'],
      expected: { a: 1, b: 2, c: 3 },
    },
    {
      name: '빈 객체',
      input: {},
      keys: [],
      expected: {},
    },
    {
      name: 'null 입력',
      input: null,
      keys: [],
      expected: {},
    },
    {
      name: 'undefined 입력',
      input: undefined,
      keys: [],
      expected: {},
    },
    {
      name: '중첩 객체',
      input: { c: { z: 1, y: 2 }, a: 1, b: 2 },
      keys: ['a', 'b'],
      expected: { a: 1, b: 2, c: { z: 1, y: 2 } },
    },
    {
      name: 'keys 배열이 비어있는 경우',
      input: { c: 3, a: 1, b: 2 },
      keys: [],
      expected: { c: 3, a: 1, b: 2 },
    },
    {
      name: 'keys 배열에 없는 키만 있는 경우',
      input: { c: 3, a: 1, b: 2 },
      keys: ['d', 'e'],
      expected: { c: 3, a: 1, b: 2 },
    },
  ];

  testCases.forEach(({ name, input, keys, expected }) => {
    it(name, () => {
      const result = sortObjectKeys(input, keys);
      const resultKeys = Object.keys(result);
      const expectedKeys = Object.keys(expected);
      expect(resultKeys).toEqual(expectedKeys);
      expect(result).toEqual(expected);
      expect(serializeNative(result)).toBe(serializeNative(expected));
    });
  });
});
