import { describe, expect, it } from 'vitest';

import { unique } from '../unique';

describe('unique', () => {
  it('기본적인 중복 제거를 수행해야 합니다', () => {
    expect(unique([1, 2, 3, 3, 4, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    expect(unique(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
  });

  it('isEqual 함수를 사용하여 중복을 제거해야 합니다', () => {
    const array = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 1, name: 'John' },
      { id: 3, name: 'Bob' },
    ];

    const result = unique(array, {
      isEqual: (a, b) => a.id === b.id,
    });

    expect(result).toEqual([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'Bob' },
    ]);
  });

  it('isEqual 함수를 사용하여 날짜 객체의 중복을 제거해야 합니다', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const dates = [today, tomorrow, today, nextWeek];

    const result = unique(dates, {
      isEqual: (a, b) => a.getTime() === b.getTime(),
    });

    expect(result).toEqual([today, tomorrow, nextWeek]);
  });

  it('mapper 함수를 사용하여 객체 배열의 중복을 제거해야 합니다', () => {
    const array = [
      { id: 1, name: 'John', role: 'admin' },
      { id: 2, name: 'Jane', role: 'user' },
      { id: 1, name: 'John', role: 'admin' },
      { id: 3, name: 'Bob', role: 'user' },
    ];

    const result = unique(array, {
      mapper: (item) => item.id,
    });

    expect(result).toEqual([
      { id: 1, name: 'John', role: 'admin' },
      { id: 2, name: 'Jane', role: 'user' },
      { id: 3, name: 'Bob', role: 'user' },
    ]);
  });

  it('mapper 함수를 사용하여 복잡한 객체의 중복을 제거해야 합니다', () => {
    type User = {
      id: number;
      name: string;
      role: 'admin' | 'user';
      department: string;
    };

    const array: User[] = [
      { id: 1, name: 'John', role: 'admin', department: 'IT' },
      { id: 2, name: 'Jane', role: 'user', department: 'HR' },
      { id: 1, name: 'John', role: 'admin', department: 'IT' },
      { id: 3, name: 'Bob', role: 'admin', department: 'IT' },
    ];

    const result = unique(array, {
      mapper: (item) => `${item.id}-${item.department}`,
    });

    expect(result).toEqual([
      { id: 1, name: 'John', role: 'admin', department: 'IT' },
      { id: 2, name: 'Jane', role: 'user', department: 'HR' },
      { id: 3, name: 'Bob', role: 'admin', department: 'IT' },
    ]);
  });

  it('중첩된 객체의 중복을 제거해야 합니다', () => {
    const array = [
      { user: { id: 1, name: 'John' }, value: 100 },
      { user: { id: 2, name: 'Jane' }, value: 200 },
      { user: { id: 1, name: 'John' }, value: 300 },
    ];

    const result = unique(array, {
      mapper: (item) => item.user.id,
    });

    expect(result).toEqual([
      { user: { id: 1, name: 'John' }, value: 100 },
      { user: { id: 2, name: 'Jane' }, value: 200 },
    ]);
  });

  it('빈 배열을 처리해야 합니다', () => {
    expect(unique([])).toEqual([]);
  });

  it('중복된 숫자 배열을 처리해야 합니다', () => {
    expect(unique([1, 1, 1, 1, 1])).toEqual([1]);
  });

  it('중복된 문자열 배열을 처리해야 합니다', () => {
    expect(unique(['a', 'a', 'a', 'a', 'a'])).toEqual(['a']);
  });

  it('복합적인 타입의 중복을 제거해야 합니다', () => {
    const array = [
      { id: 1, value: 'a' },
      { id: 2, value: 'b' },
      { id: 1, value: 'c' },
      { id: 3, value: 'd' },
    ];

    const result = unique(array, {
      mapper: (item) => item.id,
    });

    expect(result).toEqual([
      { id: 1, value: 'a' },
      { id: 2, value: 'b' },
      { id: 3, value: 'd' },
    ]);
  });
});
