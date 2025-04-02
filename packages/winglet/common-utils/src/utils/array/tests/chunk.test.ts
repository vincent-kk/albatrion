import { describe, expect, it } from 'vitest';

import { chunk } from '../chunk';

describe('chunk', () => {
  it('배열을 지정된 크기의 청크로 나누어야 합니다', () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(chunk(array, 2)).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
    ]);
    expect(chunk(array, 3)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8],
    ]);
    expect(chunk(array, 4)).toEqual([
      [1, 2, 3, 4],
      [5, 6, 7, 8],
    ]);
  });

  it('크기가 1일 때 각 요소를 개별 청크로 나누어야 합니다', () => {
    const array = [1, 2, 3, 4];
    expect(chunk(array, 1)).toEqual([[1], [2], [3], [4]]);
  });

  it('크기가 배열 길이보다 클 때 전체 배열을 하나의 청크로 반환해야 합니다', () => {
    const array = [1, 2, 3, 4];
    expect(chunk(array, 5)).toEqual([[1, 2, 3, 4]]);
  });

  it('빈 배열을 처리해야 합니다', () => {
    expect(chunk([], 2)).toEqual([]);
  });

  it('문자열 배열을 처리해야 합니다', () => {
    const array = ['a', 'b', 'c', 'd', 'e'];
    expect(chunk(array, 2)).toEqual([['a', 'b'], ['c', 'd'], ['e']]);
  });

  it('객체 배열을 처리해야 합니다', () => {
    const array = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'Bob' },
      { id: 4, name: 'Alice' },
    ];
    expect(chunk(array, 2)).toEqual([
      [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ],
      [
        { id: 3, name: 'Bob' },
        { id: 4, name: 'Alice' },
      ],
    ]);
  });

  it('정수가 아닌 크기나 음수 크기를 처리해야 합니다', () => {
    const array = [1, 2, 3, 4];
    expect(chunk(array, 2.5)).toEqual([[1, 2, 3, 4]]);
    expect(chunk(array, -1)).toEqual([[1, 2, 3, 4]]);
    expect(chunk(array, 0)).toEqual([[1, 2, 3, 4]]);
  });

  it('마지막 청크가 불완전할 때도 올바르게 처리해야 합니다', () => {
    const array = [1, 2, 3, 4, 5];
    expect(chunk(array, 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunk(array, 3)).toEqual([
      [1, 2, 3],
      [4, 5],
    ]);
  });
});
