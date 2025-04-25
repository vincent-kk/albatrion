import { describe, expect, it } from 'vitest';

import { differenceWith } from '../differenceWith';

describe('differenceWith', () => {
  it('areItemsEqual 함수를 사용하여 두 배열의 차집합을 반환해야 합니다', () => {
    expect(
      differenceWith(
        [1000, 2000, 3000],
        [1000],
        (x, y) => Math.floor(x / 1000) === Math.floor(y / 1000),
      ),
    ).toEqual([2000, 3000]);

    const array1 = [{ name: 'John' }, { name: 'Jane' }, { name: 'Bob' }];
    const array2 = [{ name: 'Jane' }, { name: 'Alice' }];

    expect(differenceWith(array1, array2, (a, b) => a.name === b.name)).toEqual(
      [{ name: 'John' }, { name: 'Bob' }],
    );
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

    const result = differenceWith(
      students,
      employees,
      (a, b) => a.studentId === b.studentId,
    );
    expect(result).toEqual([
      { studentId: 1, score: 85 },
      { studentId: 3, score: 78 },
    ]);
  });

  it('중복된 요소를 올바르게 처리해야 합니다', () => {
    expect(
      differenceWith(
        ['apple', 'apple', 'banana', 'banana', 'orange'],
        ['banana'],
        (a, b) => a === b,
      ),
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
      differenceWith(dates1, dates2, (a, b) => a.getTime() === b.getTime()),
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
      differenceWith(orders1, orders2, (a, b) => a.orderId === b.orderId),
    ).toEqual([
      { orderId: 'A001', product: 'laptop', quantity: 1 },
      { orderId: 'A003', product: 'keyboard', quantity: 1 },
    ]);
  });
});
