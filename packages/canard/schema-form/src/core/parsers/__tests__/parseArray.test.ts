import { describe, expect, it } from 'vitest';

import { parseArray } from '../parseArray';

describe('parseArray', () => {
  it('배열을 입력하면 그대로 반환해야 합니다', () => {
    const input = [1, 2, 3];
    expect(parseArray<number>(input)).toEqual(input);
  });

  it('배열이 아닌 값을 입력하면 빈 배열을 반환해야 합니다', () => {
    expect(parseArray<number>(null)).toEqual([]);
    expect(parseArray<number>(undefined)).toEqual([]);
    expect(parseArray<number>('not an array')).toEqual([]);
    expect(parseArray<number>(123)).toEqual([]);
    expect(parseArray<number>({})).toEqual([]);
  });

  it('제네릭 타입에 맞는 배열을 반환해야 합니다', () => {
    const stringArray = ['a', 'b', 'c'];
    expect(parseArray<string>(stringArray)).toEqual(stringArray);

    const numberArray = [1, 2, 3];
    expect(parseArray<number>(numberArray)).toEqual(numberArray);

    const objectArray = [{ id: 1 }, { id: 2 }];
    expect(parseArray<{ id: number }>(objectArray)).toEqual(objectArray);
  });
});
