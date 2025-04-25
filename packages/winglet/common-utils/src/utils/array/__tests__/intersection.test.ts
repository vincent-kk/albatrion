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
});
