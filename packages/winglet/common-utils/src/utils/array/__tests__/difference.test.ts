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
});
