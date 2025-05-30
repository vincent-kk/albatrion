import { describe, expect, it } from 'vitest';

import { sortWithReference } from '../sortWithReference';

describe('sortWithReference', () => {
  describe('basic functionality', () => {
    it('should sort target array according to reference order', () => {
      // Arrange
      const target = ['c', 'a', 'b', 'd'];
      const reference = ['a', 'b', 'c'];

      // Act
      const result = sortWithReference(target, reference);

      // Assert
      expect(result).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should place unreferenced items at the end', () => {
      // Arrange
      const target = ['x', 'c', 'y', 'a', 'z', 'b'];
      const reference = ['a', 'b', 'c'];

      // Act
      const result = sortWithReference(target, reference);

      // Assert
      expect(result).toEqual(['a', 'b', 'c', 'x', 'y', 'z']);
    });

    it('should maintain original order for unreferenced items', () => {
      // Arrange
      const target = ['x', 'c', 'y', 'a', 'z', 'b', 'w'];
      const reference = ['a', 'b', 'c'];

      // Act
      const result = sortWithReference(target, reference);

      // Assert
      expect(result).toEqual(['a', 'b', 'c', 'x', 'y', 'z', 'w']);
    });
  });

  describe('duplicate elements', () => {
    it('should handle duplicate elements correctly', () => {
      // Arrange
      const target = ['c', 'a', 'b', 'a', 'c', 'b'];
      const reference = ['a', 'b', 'c'];

      // Act
      const result = sortWithReference(target, reference);

      // Assert
      expect(result).toEqual(['a', 'a', 'b', 'b', 'c', 'c']);
    });

    it('should handle duplicates in both referenced and unreferenced items', () => {
      // Arrange
      const target = ['x', 'a', 'x', 'b', 'y', 'a', 'y'];
      const reference = ['a', 'b'];

      // Act
      const result = sortWithReference(target, reference);

      // Assert
      expect(result).toEqual(['a', 'a', 'b', 'x', 'x', 'y', 'y']);
    });
  });

  describe('edge cases', () => {
    it('should handle empty target array', () => {
      // Arrange
      const target: string[] = [];
      const reference = ['a', 'b', 'c'];

      // Act
      const result = sortWithReference(target, reference);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle empty reference array', () => {
      // Arrange
      const target = ['c', 'a', 'b'];
      const reference: string[] = [];

      // Act
      const result = sortWithReference(target, reference);

      // Assert
      expect(result).toEqual(['c', 'a', 'b']);
    });

    it('should handle both arrays being empty', () => {
      // Arrange
      const target: string[] = [];
      const reference: string[] = [];

      // Act
      const result = sortWithReference(target, reference);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle target with no matching reference items', () => {
      // Arrange
      const target = ['x', 'y', 'z'];
      const reference = ['a', 'b', 'c'];

      // Act
      const result = sortWithReference(target, reference);

      // Assert
      expect(result).toEqual(['x', 'y', 'z']);
    });

    it('should handle reference with no matching target items', () => {
      // Arrange
      const target = ['x', 'y', 'z'];
      const reference = ['a', 'b', 'c'];

      // Act
      const result = sortWithReference(target, reference);

      // Assert
      expect(result).toEqual(['x', 'y', 'z']);
    });
  });

  describe('different data types', () => {
    it('should work with numbers', () => {
      // Arrange
      const target = [3, 1, 4, 2, 5];
      const reference = [1, 2, 3];

      // Act
      const result = sortWithReference(target, reference);

      // Assert
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should work with objects', () => {
      // Arrange
      const obj1 = { id: 1, name: 'a' };
      const obj2 = { id: 2, name: 'b' };
      const obj3 = { id: 3, name: 'c' };
      const obj4 = { id: 4, name: 'd' };

      const target = [obj3, obj1, obj4, obj2];
      const reference = [obj1, obj2, obj3];

      // Act
      const result = sortWithReference(target, reference);

      // Assert
      expect(result).toEqual([obj1, obj2, obj3, obj4]);
    });
  });

  describe('immutability', () => {
    it('should not modify the original target array', () => {
      // Arrange
      const target = ['c', 'a', 'b', 'd'];
      const reference = ['a', 'b', 'c'];
      const originalTarget = [...target];

      // Act
      sortWithReference(target, reference);

      // Assert
      expect(target).toEqual(originalTarget);
    });

    it('should not modify the original reference array', () => {
      // Arrange
      const target = ['c', 'a', 'b', 'd'];
      const reference = ['a', 'b', 'c'];
      const originalReference = [...reference];

      // Act
      sortWithReference(target, reference);

      // Assert
      expect(reference).toEqual(originalReference);
    });
  });

  describe('performance characteristics', () => {
    it('should handle large arrays efficiently', () => {
      // Arrange
      const target = Array.from({ length: 1000 }, (_, i) => `item-${i % 100}`);
      const reference = Array.from({ length: 50 }, (_, i) => `item-${i}`);

      // Act
      const startTime = performance.now();
      const result = sortWithReference(target, reference);
      const endTime = performance.now();

      // Assert
      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms

      // Verify first elements are sorted according to reference
      const referencedItems = result.filter((item) => reference.includes(item));
      const expectedStart = reference.flatMap((refItem) =>
        target.filter((targetItem) => targetItem === refItem),
      );
      expect(referencedItems).toEqual(expectedStart);
    });
  });

  describe('complex scenarios', () => {
    it('should handle partial reference coverage correctly', () => {
      // Arrange
      const target = ['f', 'c', 'a', 'e', 'b', 'd'];
      const reference = ['a', 'b', 'c'];

      // Act
      const result = sortWithReference(target, reference);

      // Assert
      expect(result).toEqual(['a', 'b', 'c', 'f', 'e', 'd']);
    });

    it('should handle reference longer than target', () => {
      // Arrange
      const target = ['c', 'a'];
      const reference = ['a', 'b', 'c', 'd', 'e'];

      // Act
      const result = sortWithReference(target, reference);

      // Assert
      expect(result).toEqual(['a', 'c']);
    });

    it('should handle mixed case with multiple duplicates', () => {
      // Arrange
      const target = ['z', 'a', 'x', 'b', 'a', 'y', 'c', 'b', 'c', 'a'];
      const reference = ['a', 'b', 'c'];

      // Act
      const result = sortWithReference(target, reference);

      // Assert
      expect(result).toEqual([
        'a',
        'a',
        'a',
        'b',
        'b',
        'c',
        'c',
        'z',
        'x',
        'y',
      ]);
    });
  });
});
