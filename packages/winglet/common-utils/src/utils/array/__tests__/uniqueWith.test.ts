import { describe, expect, it } from 'vitest';

import { uniqueWith } from '../uniqueWith';

describe('unique', () => {
  it('isEqual 함수를 사용하여 중복을 제거해야 합니다', () => {
    const array = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 1, name: 'John' },
      { id: 3, name: 'Bob' },
    ];

    const result = uniqueWith(array, (a, b) => a.id === b.id);

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

    const result = uniqueWith(dates, (a, b) => a.getTime() === b.getTime());

    expect(result).toEqual([today, tomorrow, nextWeek]);
  });

  it('중복된 숫자 배열을 처리해야 합니다', () => {
    expect(uniqueWith([1, 1, 1, 1, 1], (a, b) => a === b)).toEqual([1]);
  });

  it('중복된 문자열 배열을 처리해야 합니다', () => {
    expect(uniqueWith(['a', 'a', 'a', 'a', 'a'], (a, b) => a === b)).toEqual([
      'a',
    ]);
  });
});
