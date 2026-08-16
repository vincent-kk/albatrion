import { describe, expect, it } from 'vitest';

import { getValue } from '../getValue';
import { setValue } from '../setValue';

/**
 * 포인터 컴파일과 setValue 가 호출자 소유 데이터·중간 `-` 세그먼트를 다루는 방식.
 */
describe('pointer handling contract', () => {
  it('should not modify the segment array the caller passed in', () => {
    const segments = ['', 'a~1b', 'c~0d'];

    getValue({}, segments);

    expect(segments).toEqual(['', 'a~1b', 'c~0d']);
  });

  it('should accept numeric segments as the error message promises', () => {
    expect(getValue({ a: [9, 8] }, ['', 'a', 0])).toBe(9);
    expect(getValue({ a: [9, 8] }, ['', 'a', 1])).toBe(8);
  });

  it('should resolve a "-" segment that is not the last one', () => {
    expect(setValue({}, '/list/-/name', 'x')).toEqual({
      list: [{ name: 'x' }],
    });
    expect(setValue({ list: [] }, ['', 'list', '-', 'name'], 'x')).toEqual({
      list: [{ name: 'x' }],
    });
  });

  it('should keep appending at the end for a trailing "-"', () => {
    expect(setValue({}, '/list/-', 'x')).toEqual({ list: ['x'] });
  });
});
