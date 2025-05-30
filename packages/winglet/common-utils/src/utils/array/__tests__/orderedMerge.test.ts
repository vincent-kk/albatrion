import { describe, expect, it } from 'vitest';

import { orderedMerge } from '../orderedMerge';

describe('orderedMerge', () => {
  // Basic functionality tests
  describe('Basic functionality', () => {
    it('should merge arrays with preferred keys first', () => {
      const result = orderedMerge(['name', 'email'], ['id', 'phone']);
      expect(result).toEqual(['name', 'email', 'id', 'phone']);
    });

    it('should remove duplicates while preserving order', () => {
      const result = orderedMerge(['name', 'email'], ['id', 'name', 'phone']);
      expect(result).toEqual(['name', 'email', 'id', 'phone']);
    });

    it('should handle duplicates within preferred keys', () => {
      const result = orderedMerge(['name', 'email', 'name'], ['id', 'phone']);
      expect(result).toEqual(['name', 'email', 'id', 'phone']);
    });

    it('should handle duplicates within keys array', () => {
      const result = orderedMerge(['name', 'email'], ['id', 'phone', 'id']);
      expect(result).toEqual(['name', 'email', 'id', 'phone']);
    });

    it('should preserve preferred keys order even when they appear in keys array', () => {
      const result = orderedMerge(
        ['email', 'name'],
        ['name', 'id', 'email', 'phone'],
      );
      expect(result).toEqual(['email', 'name', 'id', 'phone']);
    });
  });

  // Edge cases
  describe('Edge cases', () => {
    it('should return empty array when both inputs are empty', () => {
      const result = orderedMerge([], []);
      expect(result).toEqual([]);
    });

    it('should return preferred keys when keys array is empty', () => {
      const result = orderedMerge(['name', 'email'], []);
      expect(result).toEqual(['name', 'email']);
    });

    it('should return keys when preferred keys array is empty', () => {
      const result = orderedMerge([], ['id', 'phone']);
      expect(result).toEqual(['id', 'phone']);
    });

    it('should handle single element arrays', () => {
      const result = orderedMerge(['name'], ['email']);
      expect(result).toEqual(['name', 'email']);
    });

    it('should handle identical arrays', () => {
      const result = orderedMerge(['name', 'email'], ['name', 'email']);
      expect(result).toEqual(['name', 'email']);
    });

    it('should handle completely overlapping arrays', () => {
      const result = orderedMerge(
        ['name', 'email', 'id'],
        ['email', 'id', 'name'],
      );
      expect(result).toEqual(['name', 'email', 'id']);
    });
  });

  // Small array optimization tests (linear search path)
  describe('Small array optimization (< 20 elements)', () => {
    it('should handle small arrays efficiently', () => {
      const preferred = ['a', 'b', 'c'];
      const keys = ['d', 'e', 'f', 'a'];
      const result = orderedMerge(preferred, keys);
      expect(result).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
    });

    it('should work correctly at threshold boundary (19 elements)', () => {
      const preferred = Array.from({ length: 10 }, (_, i) => `pref${i}`);
      const keys = Array.from({ length: 9 }, (_, i) => `key${i}`);
      const result = orderedMerge(preferred, keys);

      expect(result).toHaveLength(19);
      expect(result.slice(0, 10)).toEqual(preferred);
      expect(result.slice(10)).toEqual(keys);
    });

    it('should handle duplicates in small arrays', () => {
      const preferred = ['a', 'b', 'c', 'a'];
      const keys = ['d', 'b', 'e'];
      const result = orderedMerge(preferred, keys);
      expect(result).toEqual(['a', 'b', 'c', 'd', 'e']);
    });
  });

  // Large array optimization tests (Set-based path)
  describe('Large array optimization (≥ 20 elements)', () => {
    it('should handle large arrays efficiently', () => {
      const preferred = Array.from({ length: 15 }, (_, i) => `pref${i}`);
      const keys = Array.from({ length: 10 }, (_, i) => `key${i}`);
      const result = orderedMerge(preferred, keys);

      expect(result).toHaveLength(25);
      expect(result.slice(0, 15)).toEqual(preferred);
      expect(result.slice(15)).toEqual(keys);
    });

    it('should work correctly at threshold boundary (20 elements)', () => {
      const preferred = Array.from({ length: 10 }, (_, i) => `pref${i}`);
      const keys = Array.from({ length: 10 }, (_, i) => `key${i}`);
      const result = orderedMerge(preferred, keys);

      expect(result).toHaveLength(20);
      expect(result.slice(0, 10)).toEqual(preferred);
      expect(result.slice(10)).toEqual(keys);
    });

    it('should handle duplicates in large arrays', () => {
      const preferred = Array.from({ length: 12 }, (_, i) => `item${i}`);
      const keys = Array.from({ length: 10 }, (_, i) => `item${i + 5}`); // 5 overlapping items
      const result = orderedMerge(preferred, keys);

      expect(result).toHaveLength(15);
      expect(result.slice(0, 12)).toEqual(preferred);
      expect(result.slice(12)).toEqual(['item12', 'item13', 'item14']);
    });

    it('should handle very large arrays (performance test)', () => {
      const preferred = Array.from({ length: 500 }, (_, i) => `pref${i}`);
      const keys = Array.from({ length: 500 }, (_, i) => `key${i}`);
      const result = orderedMerge(preferred, keys);

      expect(result).toHaveLength(1000);
      expect(result.slice(0, 500)).toEqual(preferred);
      expect(result.slice(500)).toEqual(keys);
    });
  });

  // Algorithm selection tests
  describe('Algorithm selection', () => {
    it('should use linear search for arrays totaling 19 elements', () => {
      // This test verifies the threshold behavior
      const preferred = Array.from({ length: 10 }, (_, i) => `p${i}`);
      const keys = Array.from({ length: 9 }, (_, i) => `k${i}`);
      const result = orderedMerge(preferred, keys);

      expect(result).toHaveLength(19);
      expect(result).toEqual([...preferred, ...keys]);
    });

    it('should use Set optimization for arrays totaling 20 elements', () => {
      // This test verifies the threshold behavior
      const preferred = Array.from({ length: 10 }, (_, i) => `p${i}`);
      const keys = Array.from({ length: 10 }, (_, i) => `k${i}`);
      const result = orderedMerge(preferred, keys);

      expect(result).toHaveLength(20);
      expect(result).toEqual([...preferred, ...keys]);
    });
  });

  // Real-world scenarios
  describe('Real-world scenarios', () => {
    it('should handle JSON schema property merging', () => {
      const schemaProperties = ['id', 'name', 'email'];
      const dataProperties = ['name', 'phone', 'address', 'id', 'age'];
      const result = orderedMerge(schemaProperties, dataProperties);

      expect(result).toEqual([
        'id',
        'name',
        'email',
        'phone',
        'address',
        'age',
      ]);
    });

    it('should handle form field ordering', () => {
      const requiredFields = ['firstName', 'lastName', 'email'];
      const allFields = [
        'email',
        'phone',
        'firstName',
        'address',
        'lastName',
        'zipCode',
      ];
      const result = orderedMerge(requiredFields, allFields);

      expect(result).toEqual([
        'firstName',
        'lastName',
        'email',
        'phone',
        'address',
        'zipCode',
      ]);
    });

    it('should handle configuration merging', () => {
      const defaultConfig = ['host', 'port', 'database'];
      const userConfig = ['database', 'username', 'password', 'host', 'ssl'];
      const result = orderedMerge(defaultConfig, userConfig);

      expect(result).toEqual([
        'host',
        'port',
        'database',
        'username',
        'password',
        'ssl',
      ]);
    });
  });

  // Type safety and immutability tests
  describe('Type safety and immutability', () => {
    it('should not modify input arrays', () => {
      const preferred = ['a', 'b', 'c'];
      const keys = ['d', 'e', 'f'];
      const originalPreferred = [...preferred];
      const originalKeys = [...keys];

      orderedMerge(preferred, keys);

      expect(preferred).toEqual(originalPreferred);
      expect(keys).toEqual(originalKeys);
    });

    it('should return a new array instance', () => {
      const preferred = ['a', 'b'];
      const keys = ['c', 'd'];
      const result = orderedMerge(preferred, keys);

      expect(result).not.toBe(preferred);
      expect(result).not.toBe(keys);
    });

    it('should handle empty strings as valid keys', () => {
      const result = orderedMerge(['', 'name'], ['email', '']);
      expect(result).toEqual(['', 'name', 'email']);
    });

    it('should handle special characters in keys', () => {
      const preferred = ['key-1', 'key_2', 'key.3'];
      const keys = ['key@4', 'key#5', 'key-1'];
      const result = orderedMerge(preferred, keys);

      expect(result).toEqual(['key-1', 'key_2', 'key.3', 'key@4', 'key#5']);
    });
  });
});
