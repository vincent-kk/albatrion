import { describe, expect, it } from 'vitest';

import { forEachReverse } from '../forEachReverse';

describe('forEachReverse', () => {
  it('배열을 역순으로 순회해야 합니다', () => {
    const array = [1, 2, 3, 4, 5];
    const result: number[] = [];

    forEachReverse(array, (item) => {
      result.push(item);
    });

    expect(result).toEqual([5, 4, 3, 2, 1]);
  });

  it('인덱스와 원본 배열에 접근할 수 있어야 합니다', () => {
    const array = ['a', 'b', 'c'];
    const result: Array<[string, number, string[]]> = [];

    forEachReverse(array, (item, index, arr) => {
      result.push([item, index, arr]);
    });

    expect(result).toEqual([
      ['c', 2, ['a', 'b', 'c']],
      ['b', 1, ['a', 'b', 'c']],
      ['a', 0, ['a', 'b', 'c']],
    ]);
  });

  it('빈 배열을 처리해야 합니다', () => {
    const array: number[] = [];
    const result: number[] = [];

    forEachReverse(array, (item) => {
      result.push(item);
    });

    expect(result).toEqual([]);
  });

  it('문자열 배열을 처리해야 합니다', () => {
    const array = ['hello', 'world', 'test'];
    const result: string[] = [];

    forEachReverse(array, (item) => {
      result.push(item);
    });

    expect(result).toEqual(['test', 'world', 'hello']);
  });

  it('객체 배열을 처리해야 합니다', () => {
    const array = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'Bob' },
    ];
    const result: Array<{ id: number; name: string }> = [];

    forEachReverse(array, (item) => {
      result.push(item);
    });

    expect(result).toEqual([
      { id: 3, name: 'Bob' },
      { id: 2, name: 'Jane' },
      { id: 1, name: 'John' },
    ]);
  });

  it('콜백 함수에서 원본 배열을 수정할 수 있어야 합니다', () => {
    const array = [1, 2, 3];
    const result: number[] = [];

    forEachReverse(array, (_, index, arr) => {
      arr[index] = arr[index] * 2;
      result.push(arr[index]);
    });

    expect(result).toEqual([6, 4, 2]);
    expect(array).toEqual([2, 4, 6]);
  });

  it('콜백 함수에서 false를 반환하면 루프를 중단해야 합니다', () => {
    const array = [1, 2, 3, 4, 5];
    const result: number[] = [];

    forEachReverse(array, (item) => {
      result.push(item);
      if (item === 3) return false;
      return true;
    });

    expect(result).toEqual([5, 4, 3]);
  });
});
