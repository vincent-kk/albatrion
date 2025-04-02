import { describe, expect, it } from 'vitest';

import { difference } from '../difference';

describe('difference', () => {
  it('두 배열의 차집합을 반환해야 합니다', () => {
    expect(difference(['apple', 'banana', 'orange'], ['apple'])).toEqual([
      'banana',
      'orange',
    ]);
    expect(difference([], ['apple', 'banana', 'orange'])).toEqual([]);
    expect(
      difference(['apple', 'banana', 'orange', 'grape'], ['banana', 'grape']),
    ).toEqual(['apple', 'orange']);
  });

  it('areItemsEqual 함수를 사용하여 두 배열의 차집합을 반환해야 합니다', () => {
    expect(
      difference([1000, 2000, 3000], [1000], {
        isEqual: (x, y) => Math.floor(x / 1000) === Math.floor(y / 1000),
      }),
    ).toEqual([2000, 3000]);

    const array1 = [{ name: 'John' }, { name: 'Jane' }, { name: 'Bob' }];
    const array2 = [{ name: 'Jane' }, { name: 'Alice' }];

    expect(
      difference(array1, array2, {
        isEqual: (a, b) => a.name === b.name,
      }),
    ).toEqual([{ name: 'John' }, { name: 'Bob' }]);
  });

  it('areItemsEqual 함수를 사용하여 서로 다른 타입의 요소를 가진 두 배열의 차집합을 반환해야 합니다', () => {
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

    const result = difference(students, employees, {
      isEqual: (a, b) => a.studentId === b.studentId,
    });
    expect(result).toEqual([
      { studentId: 1, score: 85 },
      { studentId: 3, score: 78 },
    ]);
  });

  it('중복된 요소를 올바르게 처리해야 합니다', () => {
    expect(
      difference(['apple', 'apple', 'banana', 'banana', 'orange'], ['banana'], {
        isEqual: (a, b) => a === b,
      }),
    ).toEqual(['apple', 'apple', 'orange']);
  });

  it('날짜 객체의 차집합을 올바르게 처리해야 합니다', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const dates1 = [today, tomorrow, nextWeek];
    const dates2 = [today];

    expect(
      difference(dates1, dates2, {
        isEqual: (a, b) => a.getTime() === b.getTime(),
      }),
    ).toEqual([tomorrow, nextWeek]);
  });

  it('복잡한 객체의 차집합을 올바르게 처리해야 합니다', () => {
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
      difference(orders1, orders2, {
        isEqual: (a, b) => a.orderId === b.orderId,
      }),
    ).toEqual([
      { orderId: 'A001', product: 'laptop', quantity: 1 },
      { orderId: 'A003', product: 'keyboard', quantity: 1 },
    ]);
  });

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

    const result = difference(array1, array2, {
      mapper: (item) => item.id,
    });

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

    const result = difference(array1, array2, {
      mapper: (item) => `${item.id}-${item.department}`,
    });

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

    const result = difference(array1, array2, {
      mapper: (item) => item.user.id,
    });

    expect(result).toEqual([{ user: { id: 3, name: 'Bob' }, value: 300 }]);
  });

  it('mapper 함수를 사용하여 문자열 배열의 차이를 찾아야 합니다', () => {
    const array1 = ['apple', 'banana', 'apricot'];
    const array2 = ['apple', 'banana'];

    const result = difference(array1, array2, {
      mapper: (item) => item.length,
    });

    expect(result).toEqual(['apricot']);
  });
});
