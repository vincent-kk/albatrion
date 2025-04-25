import { describe, expect, it } from 'vitest';

import { differenceBy } from '../differenceBy';

describe('differenceBy', () => {
  it('mapper 함수를 사용하여 객체 배열의 차이를 찾아야 합니다', () => {
    const array1 = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'Bob' },
    ];
    const array2 = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ];

    const result = differenceBy(array1, array2, (item) => item.id);

    expect(result).toEqual([{ id: 3, name: 'Bob' }]);
  });

  it('mapper 함수를 사용하여 복잡한 객체의 차이를 찾아야 합니다', () => {
    type User = {
      id: number;
      name: string;
      role: 'admin' | 'user';
      department: string;
    };

    const array1: User[] = [
      { id: 1, name: 'John', role: 'admin', department: 'IT' },
      { id: 2, name: 'Jane', role: 'user', department: 'HR' },
      { id: 3, name: 'Bob', role: 'admin', department: 'IT' },
    ];
    const array2: User[] = [
      { id: 1, name: 'John', role: 'admin', department: 'IT' },
      { id: 2, name: 'Jane', role: 'user', department: 'HR' },
    ];

    const result = differenceBy(
      array1,
      array2,
      (item) => `${item.id}-${item.department}`,
    );

    expect(result).toEqual([
      { id: 3, name: 'Bob', role: 'admin', department: 'IT' },
    ]);
  });

  it('mapper 함수를 사용하여 중첩된 객체의 차이를 찾아야 합니다', () => {
    const array1 = [
      { user: { id: 1, name: 'John' }, value: 100 },
      { user: { id: 2, name: 'Jane' }, value: 200 },
      { user: { id: 3, name: 'Bob' }, value: 300 },
    ];
    const array2 = [
      { user: { id: 1, name: 'John' }, value: 100 },
      { user: { id: 2, name: 'Jane' }, value: 200 },
    ];

    const result = differenceBy(array1, array2, (item) => item.user.id);

    expect(result).toEqual([{ user: { id: 3, name: 'Bob' }, value: 300 }]);
  });

  it('mapper 함수를 사용하여 문자열 배열의 차이를 찾아야 합니다', () => {
    const array1 = ['apple', 'banana', 'apricot'];
    const array2 = ['apple', 'banana'];

    const result = differenceBy(array1, array2, (item) => item.length);

    expect(result).toEqual(['apricot']);
  });
});
