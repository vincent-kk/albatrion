import { describe, expect, it } from 'vitest';

import { intersectionWith } from '../intersectionWith';

describe('intersectionWith', () => {
  it('mapper 함수를 사용하여 객체 배열의 교집합을 찾아야 합니다', () => {
    const array1 = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'Bob' },
    ];
    const array2 = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ];

    const result = intersectionWith(array1, array2, (a, b) => a.id === b.id);

    expect(result).toEqual([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ]);
  });

  it('mapper 함수를 사용하여 복잡한 객체의 교집합을 찾아야 합니다', () => {
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

    const result = intersectionWith(array1, array2, (a, b) => a.id === b.id);

    expect(result).toEqual([
      { id: 1, name: 'John', role: 'admin', department: 'IT' },
      { id: 2, name: 'Jane', role: 'user', department: 'HR' },
    ]);
  });

  it('mapper 함수를 사용하여 중첩된 객체의 교집합을 찾아야 합니다', () => {
    const array1 = [
      { user: { id: 1, name: 'John' }, value: 100 },
      { user: { id: 2, name: 'Jane' }, value: 200 },
      { user: { id: 3, name: 'Bob' }, value: 300 },
    ];
    const array2 = [
      { user: { id: 1, name: 'John' }, value: 100 },
      { user: { id: 2, name: 'Jane' }, value: 200 },
    ];

    const result = intersectionWith(
      array1,
      array2,
      (a, b) => a.user.id === b.user.id,
    );

    expect(result).toEqual([
      { user: { id: 1, name: 'John' }, value: 100 },
      { user: { id: 2, name: 'Jane' }, value: 200 },
    ]);
  });
});
