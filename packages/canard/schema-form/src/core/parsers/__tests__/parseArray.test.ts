import { describe, expect, it } from 'vitest';

import { parseArray } from '../parseArray';

describe('parseArray', () => {
  it('배열을 입력하면 그대로 반환해야 합니다', () => {
    const input = [1, 2, 3];
    expect(parseArray(input)).toEqual(input);
  });

  it('배열이 아닌 값을 입력하면 빈 배열을 반환해야 합니다', () => {
    expect(parseArray(null)).toEqual([]);
    expect(parseArray(undefined)).toEqual(undefined);
    expect(parseArray('not an array')).toEqual([]);
    expect(parseArray(123)).toEqual([]);
    expect(parseArray({})).toEqual([]);
  });

  it('제네릭 타입에 맞는 배열을 반환해야 합니다', () => {
    const stringArray = ['a', 'b', 'c'];
    expect(parseArray(stringArray)).toEqual(stringArray);

    const numberArray = [1, 2, 3];
    expect(parseArray(numberArray)).toEqual(numberArray);

    const objectArray = [{ id: 1 }, { id: 2 }];
    expect(parseArray(objectArray)).toEqual(objectArray);
  });
});
