import { describe, expect, it } from 'vitest';

import { getObjectKeys } from '../getObjectKeys';

describe('getObjectKeys', () => {
  it('객체의 모든 키를 반환해야 합니다', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const keys = getObjectKeys(obj);

    expect(keys).toEqual(['a', 'b', 'c']);
  });

  it('키를 정렬할 수 있어야 합니다', () => {
    const obj = { c: 3, a: 1, b: 2 };
    const keys = getObjectKeys(obj, undefined, (a, b) => a.localeCompare(b));

    expect(keys).toEqual(['a', 'b', 'c']);
  });

  it('특정 키를 제외할 수 있어야 합니다', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 };
    const keys = getObjectKeys(obj, ['b', 'd']);

    expect(keys).toEqual(['a', 'c']);
  });

  it('제외할 키와 정렬을 동시에 적용할 수 있어야 합니다', () => {
    const obj = { d: 4, c: 3, b: 2, a: 1 };
    const keys = getObjectKeys(obj, ['b'], (a, b) => a.localeCompare(b));

    expect(keys).toEqual(['a', 'c', 'd']);
  });

  it('빈 객체에 대해 빈 배열을 반환해야 합니다', () => {
    const obj = {};
    const keys = getObjectKeys(obj);

    expect(keys).toEqual([]);
  });

  it('제외할 키가 없는 경우 정렬된 키를 반환해야 합니다', () => {
    const obj = { c: 3, a: 1, b: 2 };
    const keys = getObjectKeys(obj, [], (a, b) => a.localeCompare(b));

    expect(keys).toEqual(['a', 'b', 'c']);
  });

  it('모든 키를 제외하면 빈 배열을 반환해야 합니다', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const keys = getObjectKeys(obj, ['a', 'b', 'c']);

    expect(keys).toEqual([]);
  });
});
