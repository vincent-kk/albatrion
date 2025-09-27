import { describe, expect, it } from 'vitest';

import { primitiveArrayEqual } from '../primitiveArrayEqual';

describe('primitiveArrayEqual', () => {
  describe('primitive value comparison', () => {
    it('should return true for identical number arrays', () => {
      const array1 = [1, 2, 3, 4, 5];
      const array2 = [1, 2, 3, 4, 5];

      expect(primitiveArrayEqual(array1, array2)).toBe(true);
    });

    it('should return false for different number arrays', () => {
      const array1 = [1, 2, 3, 4, 5];
      const array2 = [1, 2, 3, 4, 6];

      expect(primitiveArrayEqual(array1, array2)).toBe(false);
    });

    it('should return true for identical string arrays', () => {
      const array1 = ['apple', 'banana', 'cherry'];
      const array2 = ['apple', 'banana', 'cherry'];

      expect(primitiveArrayEqual(array1, array2)).toBe(true);
    });

    it('should return false for different string arrays', () => {
      const array1 = ['apple', 'banana', 'cherry'];
      const array2 = ['apple', 'banana', 'orange'];

      expect(primitiveArrayEqual(array1, array2)).toBe(false);
    });

    it('should return true for identical boolean arrays', () => {
      const array1 = [true, false, true, false];
      const array2 = [true, false, true, false];

      expect(primitiveArrayEqual(array1, array2)).toBe(true);
    });

    it('should return false for different boolean arrays', () => {
      const array1 = [true, false, true, false];
      const array2 = [true, false, false, true];

      expect(primitiveArrayEqual(array1, array2)).toBe(false);
    });
  });

  describe('mixed type arrays', () => {
    it('should return true for identical mixed type arrays', () => {
      const array1 = [1, 'two', true, null, undefined];
      const array2 = [1, 'two', true, null, undefined];

      expect(primitiveArrayEqual(array1, array2)).toBe(true);
    });

    it('should return false for mixed arrays with different values', () => {
      const array1 = [1, 'two', true, null, undefined];
      const array2 = [1, 'two', false, null, undefined];

      expect(primitiveArrayEqual(array1, array2)).toBe(false);
    });

    it('should return false for type mismatch (strict equality)', () => {
      const array1 = [1, 2, 3];
      const array2 = ['1', '2', '3'];

      expect(primitiveArrayEqual(array1, array2)).toBe(false);
    });
  });

  describe('different lengths', () => {
    it('should return false for arrays with different lengths (shorter)', () => {
      const array1 = [1, 2, 3, 4, 5];
      const array2 = [1, 2, 3];

      expect(primitiveArrayEqual(array1, array2)).toBe(false);
    });

    it('should return false for arrays with different lengths (longer)', () => {
      const array1 = [1, 2, 3];
      const array2 = [1, 2, 3, 4, 5];

      expect(primitiveArrayEqual(array1, array2)).toBe(false);
    });

    it('should return true for empty arrays', () => {
      expect(primitiveArrayEqual([], [])).toBe(true);
    });

    it('should return false when comparing empty array with non-empty array', () => {
      expect(primitiveArrayEqual([], [1])).toBe(false);
      expect(primitiveArrayEqual([1], [])).toBe(false);
    });
  });

  describe('object reference comparison', () => {
    it('should return true for arrays with same object references', () => {
      const obj1 = { id: 1, name: 'test' };
      const obj2 = { id: 2, name: 'test2' };
      const array1 = [obj1, obj2];
      const array2 = [obj1, obj2];

      expect(primitiveArrayEqual(array1, array2)).toBe(true);
    });

    it('should return false for arrays with different object references', () => {
      const array1 = [{ id: 1 }, { id: 2 }];
      const array2 = [{ id: 1 }, { id: 2 }]; // Different objects with same content

      expect(primitiveArrayEqual(array1, array2)).toBe(false);
    });

    it('should handle arrays as elements correctly', () => {
      const arr = [1, 2, 3];
      const array1 = [arr, arr];
      const array2 = [arr, arr];
      const array3 = [
        [1, 2, 3],
        [1, 2, 3],
      ]; // Different array instances

      expect(primitiveArrayEqual(array1, array2)).toBe(true);
      expect(primitiveArrayEqual(array1, array3)).toBe(false);
    });
  });

  describe('special values', () => {
    it('should handle NaN correctly (NaN !== NaN)', () => {
      const array1 = [NaN, 1, 2];
      const array2 = [NaN, 1, 2];

      // NaN !== NaN in JavaScript
      expect(primitiveArrayEqual(array1, array2)).toBe(false);
    });

    it('should handle null and undefined correctly', () => {
      const array1 = [null, undefined, null];
      const array2 = [null, undefined, null];
      const array3 = [undefined, null, undefined];

      expect(primitiveArrayEqual(array1, array2)).toBe(true);
      expect(primitiveArrayEqual(array1, array3)).toBe(false);
    });

    it('should handle Infinity correctly', () => {
      const array1 = [Infinity, -Infinity, 0];
      const array2 = [Infinity, -Infinity, 0];
      const array3 = [Infinity, Infinity, 0];

      expect(primitiveArrayEqual(array1, array2)).toBe(true);
      expect(primitiveArrayEqual(array1, array3)).toBe(false);
    });

    it('should handle -0 and +0 as equal', () => {
      const array1 = [-0, +0, 0];
      const array2 = [0, 0, -0];

      // In JavaScript, -0 === +0
      expect(primitiveArrayEqual(array1, array2)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle single element arrays', () => {
      expect(primitiveArrayEqual([1], [1])).toBe(true);
      expect(primitiveArrayEqual([1], [2])).toBe(false);
      expect(primitiveArrayEqual(['a'], ['a'])).toBe(true);
      expect(primitiveArrayEqual([true], [false])).toBe(false);
    });

    it('should handle large arrays efficiently', () => {
      const size = 10000;
      const array1 = Array.from({ length: size }, (_, i) => i);
      const array2 = Array.from({ length: size }, (_, i) => i);
      const array3 = Array.from({ length: size }, (_, i) =>
        i === size - 1 ? -1 : i,
      );

      expect(primitiveArrayEqual(array1, array2)).toBe(true);
      expect(primitiveArrayEqual(array1, array3)).toBe(false);
    });

    it('should return false early for length mismatch', () => {
      const array1 = Array.from({ length: 10000 }, () => 'test');
      const array2 = Array.from({ length: 9999 }, () => 'test');

      // Should return false immediately without comparing elements
      expect(primitiveArrayEqual(array1, array2)).toBe(false);
    });
  });
});
