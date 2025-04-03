import { describe, expect, it } from 'vitest';

import { forEachDual } from '../forEachDual';

describe('forEachDual', () => {
  it('두 배열의 길이가 같을 때 모든 요소를 순회해야 합니다', () => {
    const array1 = [1, 2, 3];
    const array2 = ['a', 'b', 'c'];
    const result: Array<[number | undefined, string | undefined, number]> = [];

    forEachDual(array1, array2, (item1, item2, index) => {
      result.push([item1, item2, index]);
    });

    expect(result).toEqual([
      [1, 'a', 0],
      [2, 'b', 1],
      [3, 'c', 2],
    ]);
  });

  it('첫 번째 배열이 더 길 때 undefined로 처리해야 합니다', () => {
    const array1 = [1, 2, 3, 4];
    const array2 = ['a', 'b'];
    const result: Array<[number | undefined, string | undefined, number]> = [];

    forEachDual(array1, array2, (item1, item2, index) => {
      result.push([item1, item2, index]);
    });

    expect(result).toEqual([
      [1, 'a', 0],
      [2, 'b', 1],
      [3, undefined, 2],
      [4, undefined, 3],
    ]);
  });

  it('두 번째 배열이 더 길 때 undefined로 처리해야 합니다', () => {
    const array1 = [1, 2];
    const array2 = ['a', 'b', 'c', 'd'];
    const result: Array<[number | undefined, string | undefined, number]> = [];

    forEachDual(array1, array2, (item1, item2, index) => {
      result.push([item1, item2, index]);
    });

    expect(result).toEqual([
      [1, 'a', 0],
      [2, 'b', 1],
      [undefined, 'c', 2],
      [undefined, 'd', 3],
    ]);
  });

  it('빈 배열을 처리해야 합니다', () => {
    const array1: number[] = [];
    const array2: string[] = [];
    const result: Array<[number | undefined, string | undefined, number]> = [];

    forEachDual(array1, array2, (item1, item2, index) => {
      result.push([item1, item2, index]);
    });

    expect(result).toEqual([]);
  });

  it('원본 배열에 접근할 수 있어야 합니다', () => {
    const array1 = [1, 2, 3];
    const array2 = ['a', 'b', 'c'];
    const result: Array<[number[], string[]]> = [];

    forEachDual(array1, array2, (_, __, ___, arr1, arr2) => {
      result.push([arr1, arr2]);
    });

    expect(result[0]).toEqual([array1, array2]);
  });

  it('복잡한 객체 배열을 처리해야 합니다', () => {
    type User = { id: number; name: string };
    type Order = { orderId: string; amount: number };

    const users: User[] = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ];
    const orders: Order[] = [
      { orderId: 'A001', amount: 100 },
      { orderId: 'A002', amount: 200 },
      { orderId: 'A003', amount: 300 },
    ];

    const result: Array<[User | undefined, Order | undefined, number]> = [];

    forEachDual(users, orders, (user, order, index) => {
      result.push([user, order, index]);
    });

    expect(result).toEqual([
      [{ id: 1, name: 'John' }, { orderId: 'A001', amount: 100 }, 0],
      [{ id: 2, name: 'Jane' }, { orderId: 'A002', amount: 200 }, 1],
      [undefined, { orderId: 'A003', amount: 300 }, 2],
    ]);
  });

  it('콜백 함수에서 원본 배열을 수정할 수 있어야 합니다', () => {
    const array1 = [1, 2, 3];
    const array2 = ['a', 'b', 'c'];
    const result: number[] = [];

    forEachDual(array1, array2, (_, __, index, arr1) => {
      arr1[index] = arr1[index] * 2;
      result.push(arr1[index]);
    });

    expect(result).toEqual([2, 4, 6]);
    expect(array1).toEqual([2, 4, 6]);
  });

  it('콜백 함수에서 false를 반환하면 루프를 중단해야 합니다', () => {
    const array1 = [1, 2, 3, 4, 5];
    const array2 = ['a', 'b', 'c', 'd', 'e'];
    const result: Array<[number | undefined, string | undefined, number]> = [];

    forEachDual(array1, array2, (item1, item2, index) => {
      result.push([item1, item2, index]);
      if (index === 2) return false;
      return true;
    });

    expect(result).toEqual([
      [1, 'a', 0],
      [2, 'b', 1],
      [3, 'c', 2],
    ]);
  });
});
