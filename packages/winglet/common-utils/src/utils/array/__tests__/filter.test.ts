import { describe, expect, it, vi } from 'vitest';

import { filter } from '../filter';

describe('filter', () => {
  it('should filter elements based on the callback condition', () => {
    const array = [1, 2, 3, 4, 5];
    const callback = (item: number) => item % 2 === 0;

    const result = filter(array, callback);

    expect(result).toEqual([2, 4]);
  });

  it('should pass index and array to callback', () => {
    const array = [1, 2, 3, 4, 5];
    const callback = vi
      .fn()
      .mockImplementation((_: number, index: number, __: number[]) => {
        return index % 2 === 0;
      });

    filter(array, callback);

    expect(callback).toHaveBeenCalledTimes(5);
    expect(callback).toHaveBeenNthCalledWith(1, 1, 0, array);
    expect(callback).toHaveBeenNthCalledWith(2, 2, 1, array);
    expect(callback).toHaveBeenNthCalledWith(3, 3, 2, array);
    expect(callback).toHaveBeenNthCalledWith(4, 4, 3, array);
    expect(callback).toHaveBeenNthCalledWith(5, 5, 4, array);
  });

  it('should handle empty arrays', () => {
    const array: number[] = [];
    const callback = vi.fn();

    const result = filter(array, callback);

    expect(result).toEqual([]);
    expect(callback).not.toHaveBeenCalled();
  });

  it('should return a new array without modifying the original', () => {
    const array = [1, 2, 3, 4, 5];
    const callback = (item: number) => item % 2 === 0;

    const result = filter(array, callback);

    expect(result).not.toBe(array);
    expect(array).toEqual([1, 2, 3, 4, 5]);
  });

  it('should filter complex objects based on their properties', () => {
    interface User {
      id: number;
      name: string;
      age: number;
    }

    const users: User[] = [
      { id: 1, name: '김철수', age: 25 },
      { id: 2, name: '이영희', age: 30 },
      { id: 3, name: '박지민', age: 17 },
      { id: 4, name: '최수진', age: 22 },
    ];

    const callback = (user: User) => user.age >= 20;

    const result = filter(users, callback);

    expect(result).toEqual([
      { id: 1, name: '김철수', age: 25 },
      { id: 2, name: '이영희', age: 30 },
      { id: 4, name: '최수진', age: 22 },
    ]);
  });

  it('should return an empty array when no elements match the condition', () => {
    const array = [1, 3, 5, 7, 9];
    const callback = (item: number) => item % 2 === 0;

    const result = filter(array, callback);

    expect(result).toEqual([]);
  });

  it('should return all elements when all match the condition', () => {
    const array = [2, 4, 6, 8, 10];
    const callback = (item: number) => item % 2 === 0;

    const result = filter(array, callback);

    expect(result).toEqual(array);
    expect(result).not.toBe(array);
  });
});
