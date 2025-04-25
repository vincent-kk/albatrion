import { describe, expect, it, vi } from 'vitest';

import { map } from '../map';

describe('map', () => {
  it('should transform each element in the array', () => {
    const array = [1, 2, 3];
    const callback = (item: number) => item * 2;

    const result = map(array, callback);

    expect(result).toEqual([2, 4, 6]);
  });

  it('should pass index and array to callback', () => {
    const array = [1, 2, 3];
    const callback = vi
      .fn()
      .mockImplementation((item: number, index: number, arr: number[]) => {
        return item + index;
      });

    map(array, callback);

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenNthCalledWith(1, 1, 0, array);
    expect(callback).toHaveBeenNthCalledWith(2, 2, 1, array);
    expect(callback).toHaveBeenNthCalledWith(3, 3, 2, array);
  });

  it('should handle empty arrays', () => {
    const array: number[] = [];
    const callback = vi.fn();

    const result = map(array, callback);

    expect(result).toEqual([]);
    expect(callback).not.toHaveBeenCalled();
  });

  it('should work with different types', () => {
    const array = [1, 2, 3];
    const callback = (item: number) => item.toString();

    const result = map(array, callback);

    expect(result).toEqual(['1', '2', '3']);
  });

  it('should preserve array length', () => {
    const array = [1, 2, 3];
    const callback = (item: number) => item * 2;

    const result = map(array, callback);

    expect(result.length).toBe(array.length);
  });
});
