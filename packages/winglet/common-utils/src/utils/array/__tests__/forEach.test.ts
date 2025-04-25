import { describe, expect, it, vi } from 'vitest';

import { forEach } from '../forEach';

describe('forEach', () => {
  it('should call callback for each element in the array', () => {
    const array = [1, 2, 3];
    const callback = vi.fn();

    forEach(array, callback);

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenNthCalledWith(1, 1, 0, array);
    expect(callback).toHaveBeenNthCalledWith(2, 2, 1, array);
    expect(callback).toHaveBeenNthCalledWith(3, 3, 2, array);
  });

  it('should break the loop when callback returns false', () => {
    const array = [1, 2, 3, 4, 5];
    const callback = vi.fn().mockImplementation((item: number) => {
      if (item === 3) return false;
      return true;
    });

    forEach(array, callback);

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenNthCalledWith(1, 1, 0, array);
    expect(callback).toHaveBeenNthCalledWith(2, 2, 1, array);
    expect(callback).toHaveBeenNthCalledWith(3, 3, 2, array);
  });

  it('should handle empty arrays', () => {
    const array: number[] = [];
    const callback = vi.fn();

    forEach(array, callback);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should work with different types', () => {
    const array = ['a', 'b', 'c'];
    const callback = vi.fn();

    forEach(array, callback);

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenNthCalledWith(1, 'a', 0, array);
    expect(callback).toHaveBeenNthCalledWith(2, 'b', 1, array);
    expect(callback).toHaveBeenNthCalledWith(3, 'c', 2, array);
  });
});
