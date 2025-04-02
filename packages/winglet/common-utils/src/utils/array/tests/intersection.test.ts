import { describe, expect, it } from 'vitest';

import { intersection } from '../intersection';

describe('intersection', () => {
  it('두 배열의 교집합을 반환해야 합니다', () => {
    expect(intersection(['apple', 'banana', 'orange'], ['apple'])).toEqual([
      'apple',
    ]);
    expect(intersection([], ['apple', 'banana', 'orange'])).toEqual([]);
    expect(
      intersection(['apple', 'banana', 'orange', 'grape'], ['banana', 'grape']),
    ).toEqual(['banana', 'grape']);
  });

  it('isEqual 함수를 사용하여 두 배열의 교집합을 반환해야 합니다', () => {
    expect(
      intersection([1000, 2000, 3000], [1000], {
        isEqual: (x, y) => Math.floor(x / 1000) === Math.floor(y / 1000),
      }),
    ).toEqual([1000]);

    const array1 = [{ name: 'John' }, { name: 'Jane' }, { name: 'Bob' }];
    const array2 = [{ name: 'Jane' }, { name: 'Alice' }];

    expect(
      intersection(array1, array2, {
        isEqual: (a, b) => a.name === b.name,
      }),
    ).toEqual([{ name: 'Jane' }]);
  });

  it('isEqual 함수를 사용하여 서로 다른 타입의 요소를 가진 두 배열의 교집합을 반환해야 합니다', () => {
    type Student = { studentId: number; score: number };
    type Employee = { studentId: number; salary: number };

    const students: Student[] = [
      { studentId: 1, score: 85 },
      { studentId: 2, score: 92 },
      { studentId: 3, score: 78 },
    ];
    const employees: Employee[] = [
      { studentId: 2, salary: 3000 },
      { studentId: 4, salary: 4000 },
    ];

    const result = intersection(students, employees, {
      isEqual: (a, b) => a.studentId === b.studentId,
    });
    expect(result).toEqual([{ studentId: 2, score: 92 }]);
  });

  it('중복된 요소를 올바르게 처리해야 합니다', () => {
    expect(
      intersection(
        ['apple', 'apple', 'banana', 'banana', 'orange'],
        ['banana'],
        {
          isEqual: (a, b) => a === b,
        },
      ),
    ).toEqual(['banana', 'banana']);
  });

  it('날짜 객체의 교집합을 올바르게 처리해야 합니다', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const dates1 = [today, tomorrow, nextWeek];
    const dates2 = [today];

    expect(
      intersection(dates1, dates2, {
        isEqual: (a, b) => a.getTime() === b.getTime(),
      }),
    ).toEqual([today]);
  });

  it('복잡한 객체의 교집합을 올바르게 처리해야 합니다', () => {
    const orders1 = [
      { orderId: 'A001', product: 'laptop', quantity: 1 },
      { orderId: 'A002', product: 'mouse', quantity: 2 },
      { orderId: 'A003', product: 'keyboard', quantity: 1 },
    ];
    const orders2 = [
      { orderId: 'A002', product: 'mouse', quantity: 2 },
      { orderId: 'A004', product: 'monitor', quantity: 1 },
    ];

    expect(
      intersection(orders1, orders2, {
        isEqual: (a, b) => a.orderId === b.orderId,
      }),
    ).toEqual([{ orderId: 'A002', product: 'mouse', quantity: 2 }]);
  });

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

    const result = intersection(array1, array2, {
      mapper: (item) => item.id,
    });

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

    const result = intersection(array1, array2, {
      mapper: (item) => `${item.id}-${item.department}`,
    });

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

    const result = intersection(array1, array2, {
      mapper: (item) => item.user.id,
    });

    expect(result).toEqual([
      { user: { id: 1, name: 'John' }, value: 100 },
      { user: { id: 2, name: 'Jane' }, value: 200 },
    ]);
  });
});
