import { describe, expect, it } from 'vitest';

import { at } from '../at';

describe('at', () => {
  it('단일 인덱스로 배열의 요소를 가져와야 합니다', () => {
    const array = [1, 2, 3, 4, 5];
    expect(at(array, 0)).toBe(1);
    expect(at(array, 2)).toBe(3);
    expect(at(array, -1)).toBe(5);
    expect(at(array, -2)).toBe(4);
  });

  it('여러 인덱스로 배열의 요소들을 가져와야 합니다', () => {
    const array = [1, 2, 3, 4, 5];
    expect(at(array, [0, 2, 4])).toEqual([1, 3, 5]);
    expect(at(array, [-1, -3, -5])).toEqual([5, 3, 1]);
    expect(at(array, [1, -1, 0])).toEqual([2, 5, 1]);
  });

  it('정수가 아닌 인덱스를 처리해야 합니다', () => {
    const array = [1, 2, 3, 4, 5];
    expect(at(array, [1.2, 2.7, 3.1])).toEqual([2, 3, 4]);
    expect(at(array, [-1.5, -2.8])).toEqual([5, 4]);
  });

  it('빈 배열을 처리해야 합니다', () => {
    const array: number[] = [];
    expect(at(array, 0)).toBeUndefined();
    expect(at(array, [0, 1, 2])).toEqual([undefined, undefined, undefined]);
  });

  it('문자열 배열을 처리해야 합니다', () => {
    const array = ['a', 'b', 'c', 'd'];
    expect(at(array, 1)).toBe('b');
    expect(at(array, [-1, -2])).toEqual(['d', 'c']);
  });

  it('객체 배열을 처리해야 합니다', () => {
    const array = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'Bob' },
    ];
    expect(at(array, 1)).toEqual({ id: 2, name: 'Jane' });
    expect(at(array, [0, -1])).toEqual([
      { id: 1, name: 'John' },
      { id: 3, name: 'Bob' },
    ]);
  });

  it('배열 범위를 벗어난 인덱스를 처리해야 합니다', () => {
    const array = [1, 2, 3];
    expect(at(array, 5)).toBeUndefined();
    expect(at(array, [-5])).toEqual([undefined]);
    expect(at(array, [1, 5, -5])).toEqual([2, undefined, undefined]);
  });
});
