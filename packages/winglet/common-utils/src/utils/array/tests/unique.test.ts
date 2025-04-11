import { describe, expect, it } from 'vitest';

import { unique } from '../unique';

describe('unique', () => {
  it('기본적인 중복 제거를 수행해야 합니다', () => {
    expect(unique([1, 2, 3, 3, 4, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    expect(unique(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
  });

  it('빈 배열을 처리해야 합니다', () => {
    expect(unique([])).toEqual([]);
  });

  it('중복된 숫자 배열을 처리해야 합니다', () => {
    expect(unique([1, 1, 1, 1, 1])).toEqual([1]);
  });

  it('중복된 문자열 배열을 처리해야 합니다', () => {
    expect(unique(['a', 'a', 'a', 'a', 'a'])).toEqual(['a']);
  });
});
