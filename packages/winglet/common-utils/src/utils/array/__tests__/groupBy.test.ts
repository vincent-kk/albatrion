import { describe, expect, it } from 'vitest';

import { groupBy } from '../groupBy';

describe('groupBy', () => {
  it('객체 배열을 속성값으로 그룹화해야 합니다', () => {
    const array = [
      { id: 1, category: 'A' },
      { id: 2, category: 'B' },
      { id: 3, category: 'A' },
      { id: 4, category: 'C' },
    ];

    const result = groupBy(array, (item) => item.category);

    expect(result).toEqual({
      A: [
        { id: 1, category: 'A' },
        { id: 3, category: 'A' },
      ],
      B: [{ id: 2, category: 'B' }],
      C: [{ id: 4, category: 'C' }],
    });
  });

  it('숫자 배열을 그룹화해야 합니다', () => {
    const array = [1, 2, 3, 4, 5, 6];
    const result = groupBy(array, (item) => (item % 2 === 0 ? 'even' : 'odd'));

    expect(result).toEqual({
      even: [2, 4, 6],
      odd: [1, 3, 5],
    });
  });

  it('문자열 배열을 그룹화해야 합니다', () => {
    const array = ['apple', 'banana', 'apricot', 'blueberry'];
    const result = groupBy(array, (item) => item[0]);

    expect(result).toEqual({
      a: ['apple', 'apricot'],
      b: ['banana', 'blueberry'],
    });
  });

  it('빈 배열을 처리해야 합니다', () => {
    const array: number[] = [];
    const result = groupBy(array, (item) => item);

    expect(result).toEqual({});
  });

  it('복잡한 객체를 그룹화해야 합니다', () => {
    type User = {
      id: number;
      name: string;
      role: 'admin' | 'user';
      department: string;
    };

    const array: User[] = [
      { id: 1, name: 'John', role: 'admin', department: 'IT' },
      { id: 2, name: 'Jane', role: 'user', department: 'HR' },
      { id: 3, name: 'Bob', role: 'admin', department: 'IT' },
      { id: 4, name: 'Alice', role: 'user', department: 'HR' },
    ];

    const result = groupBy(array, (item) => item.department);

    expect(result).toEqual({
      IT: [
        { id: 1, name: 'John', role: 'admin', department: 'IT' },
        { id: 3, name: 'Bob', role: 'admin', department: 'IT' },
      ],
      HR: [
        { id: 2, name: 'Jane', role: 'user', department: 'HR' },
        { id: 4, name: 'Alice', role: 'user', department: 'HR' },
      ],
    });
  });

  it('중첩된 속성으로 그룹화해야 합니다', () => {
    const array = [
      { user: { role: 'admin' }, value: 1 },
      { user: { role: 'user' }, value: 2 },
      { user: { role: 'admin' }, value: 3 },
    ];

    const result = groupBy(array, (item) => item.user.role);

    expect(result).toEqual({
      admin: [
        { user: { role: 'admin' }, value: 1 },
        { user: { role: 'admin' }, value: 3 },
      ],
      user: [{ user: { role: 'user' }, value: 2 }],
    });
  });

  it('함수를 키로 사용하여 그룹화해야 합니다', () => {
    const array = [1, 2, 3, 4, 5];
    const result = groupBy(array, (item) => (item > 3 ? 'large' : 'small'));

    expect(result).toEqual({
      small: [1, 2, 3],
      large: [4, 5],
    });
  });
});
