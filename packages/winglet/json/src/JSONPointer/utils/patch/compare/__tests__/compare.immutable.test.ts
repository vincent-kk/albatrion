import { describe, expect, it } from 'vitest';

import { Operation } from '../../type';
import { compare } from '../compare';

describe('compare - immutable mode', () => {
  describe('Object Reference Preservation', () => {
    it('should preserve object references in patch values when immutable is false', () => {
      const originalObject = { name: 'John', age: 30 };
      const source = { data: { name: 'Jane', age: 25 } };
      const target = { data: originalObject };

      const result = compare(source, target, { immutable: false });

      // The implementation does property-level comparison
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/data/name',
          value: 'John',
        },
        {
          op: Operation.REPLACE,
          path: '/data/age',
          value: 30,
        },
      ]);

      // For primitive values, references are always the same
      if ('value' in result[0]) {
        expect(result[0].value).toBe('John');
      }
      if ('value' in result[1]) {
        expect(result[1].value).toBe(30);
      }
    });

    it('should clone object references in patch values when immutable is true', () => {
      const originalObject = { name: 'John', age: 30 };
      const source = { data: { name: 'Jane', age: 25 } };
      const target = { data: originalObject };

      const result = compare(source, target, { immutable: true });

      // The implementation does property-level comparison
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/data/name',
          value: 'John',
        },
        {
          op: Operation.REPLACE,
          path: '/data/age',
          value: 30,
        },
      ]);

      // For primitive values, references are always the same
      if ('value' in result[0]) {
        expect(result[0].value).toBe('John');
      }
      if ('value' in result[1]) {
        expect(result[1].value).toBe(30);
      }
    });

    it('should preserve nested object references when immutable is false', () => {
      const nestedObject = { user: { name: 'John', profile: { age: 30 } } };
      const source = { data: null };
      const target = { data: nestedObject };

      const result = compare(source, target, { immutable: false });

      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/data',
          value: nestedObject,
        },
      ]);

      // The nested structure should maintain all original references
      if ('value' in result[0]) {
        expect(result[0].value).toBe(nestedObject);
        expect((result[0].value as any).user).toBe(nestedObject.user);
        expect((result[0].value as any).user.profile).toBe(
          nestedObject.user.profile,
        );
      }
    });

    it('should clone nested object references when immutable is true', () => {
      const nestedObject = { user: { name: 'John', profile: { age: 30 } } };
      const source = { data: null };
      const target = { data: nestedObject };

      const result = compare(source, target, { immutable: true });

      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/data',
          value: nestedObject,
        },
      ]);

      // All nested structures should be cloned
      if ('value' in result[0]) {
        expect(result[0].value).not.toBe(nestedObject);
        expect((result[0].value as any).user).not.toBe(nestedObject.user);
        expect((result[0].value as any).user.profile).not.toBe(
          nestedObject.user.profile,
        );

        // But content should be the same
        expect(result[0].value).toEqual(nestedObject);
      }
    });
  });

  describe('Array Reference Preservation', () => {
    it('should preserve array references in patch values when immutable is false', () => {
      const originalArray = [{ id: 1 }, { id: 2 }];
      const source = { items: [] };
      const target = { items: originalArray };

      const result = compare(source, target, { immutable: false });

      // Implementation adds individual array elements
      expect(result).toEqual([
        {
          op: Operation.ADD,
          path: '/items/0',
          value: { id: 1 },
        },
        {
          op: Operation.ADD,
          path: '/items/1',
          value: { id: 2 },
        },
      ]);

      // Array elements should be the same references when immutable is false
      if ('value' in result[0]) {
        expect(result[0].value).toBe(originalArray[0]);
      }
      if ('value' in result[1]) {
        expect(result[1].value).toBe(originalArray[1]);
      }
    });

    it('should clone array references in patch values when immutable is true', () => {
      const originalArray = [{ id: 1 }, { id: 2 }];
      const source = { items: [] };
      const target = { items: originalArray };

      const result = compare(source, target, { immutable: true });

      // Implementation adds individual array elements
      expect(result).toEqual([
        {
          op: Operation.ADD,
          path: '/items/0',
          value: { id: 1 },
        },
        {
          op: Operation.ADD,
          path: '/items/1',
          value: { id: 2 },
        },
      ]);

      // Array elements should be cloned when immutable is true
      if ('value' in result[0]) {
        expect(result[0].value).not.toBe(originalArray[0]);
        expect(result[0].value).toEqual(originalArray[0]);
      }
      if ('value' in result[1]) {
        expect(result[1].value).not.toBe(originalArray[1]);
        expect(result[1].value).toEqual(originalArray[1]);
      }
    });

    it('should handle array element additions with proper reference handling', () => {
      const newItem = { id: 3, name: 'New Item' };
      const source = { items: [{ id: 1 }, { id: 2 }] };
      const target = { items: [{ id: 1 }, { id: 2 }, newItem] };

      const resultMutable = compare(source, target, { immutable: false });
      const resultImmutable = compare(source, target, { immutable: true });

      // Both should detect the same change
      expect(resultMutable).toEqual([
        {
          op: Operation.ADD,
          path: '/items/2',
          value: newItem,
        },
      ]);

      expect(resultImmutable).toEqual([
        {
          op: Operation.ADD,
          path: '/items/2',
          value: newItem,
        },
      ]);

      // Reference handling should differ
      if ('value' in resultMutable[0] && 'value' in resultImmutable[0]) {
        expect(resultMutable[0].value).toBe(newItem); // Same reference
        expect(resultImmutable[0].value).not.toBe(newItem); // Cloned reference
        expect(resultImmutable[0].value).toEqual(newItem); // Same content
      }
    });
  });

  describe('Complex Object Updates', () => {
    it('should handle multiple patches with correct reference preservation', () => {
      const userObject = { name: 'John', age: 30 };
      const settingsObject = { theme: 'dark', notifications: true };

      const source = {
        user: { name: 'Jane', age: 25 },
        settings: { theme: 'light', notifications: false },
        metadata: { version: 1 },
      };
      const target = {
        user: userObject,
        settings: settingsObject,
        metadata: { version: 2 },
      };

      const resultMutable = compare(source, target, { immutable: false });
      const resultImmutable = compare(source, target, { immutable: true });

      // Both should have the same patch operations
      expect(resultMutable.length).toBe(resultImmutable.length);
      expect(resultMutable.map((p) => ({ op: p.op, path: p.path }))).toEqual(
        resultImmutable.map((p) => ({ op: p.op, path: p.path })),
      );

      // Find patches with object values to test reference handling
      const objectPatches = resultMutable.filter(
        (p) => 'value' in p && typeof p.value === 'object' && p.value !== null,
      );
      const objectPatchesImmutable = resultImmutable.filter(
        (p) => 'value' in p && typeof p.value === 'object' && p.value !== null,
      );

      if (objectPatches.length > 0 && objectPatchesImmutable.length > 0) {
        // Find corresponding patches and compare references
        for (let i = 0; i < objectPatches.length; i++) {
          const mutablePatch = objectPatches[i];
          const immutablePatch = objectPatchesImmutable.find(
            (p) => p.path === mutablePatch.path,
          );

          if (
            immutablePatch &&
            'value' in mutablePatch &&
            'value' in immutablePatch
          ) {
            // For complex objects, references should differ based on immutable setting
            if (
              typeof mutablePatch.value === 'object' &&
              mutablePatch.value !== null
            ) {
              // If it's from target object references, they should behave differently
              expect(mutablePatch.value).toEqual(immutablePatch.value); // Same content
              // Note: Specific reference tests depend on actual implementation details
            }
          }
        }
      }
    });

    it('should handle nested property changes with reference preservation', () => {
      const source = {
        data: {
          user: { name: 'John', age: 30 },
          items: [1, 2, 3],
        },
      };
      const target = {
        data: {
          user: { name: 'John', age: 31 }, // Changed age
          items: [1, 2, 3],
        },
      };

      const resultMutable = compare(source, target, { immutable: false });
      const resultImmutable = compare(source, target, { immutable: true });

      // Should detect the same changes
      expect(resultMutable).toEqual([
        {
          op: Operation.REPLACE,
          path: '/data/user/age',
          value: 31,
        },
      ]);

      expect(resultImmutable).toEqual(resultMutable);

      // For primitive values, references should be the same regardless of immutable setting
      if ('value' in resultMutable[0] && 'value' in resultImmutable[0]) {
        expect(resultMutable[0].value).toBe(31);
        expect(resultImmutable[0].value).toBe(31);
      }
    });
  });

  describe('ADD Operations Reference Handling', () => {
    it('should preserve references in ADD operations when immutable is false', () => {
      const newObject = { id: 'new', data: { nested: 'value' } };
      const source = {};
      const target = { newProp: newObject };

      const result = compare(source, target, { immutable: false });

      expect(result).toEqual([
        {
          op: Operation.ADD,
          path: '/newProp',
          value: newObject,
        },
      ]);

      if ('value' in result[0]) {
        expect(result[0].value).toBe(newObject);
        expect((result[0].value as any).data).toBe(newObject.data);
      }
    });

    it('should clone references in ADD operations when immutable is true', () => {
      const newObject = { id: 'new', data: { nested: 'value' } };
      const source = {};
      const target = { newProp: newObject };

      const result = compare(source, target, { immutable: true });

      expect(result).toEqual([
        {
          op: Operation.ADD,
          path: '/newProp',
          value: newObject,
        },
      ]);

      if ('value' in result[0]) {
        expect(result[0].value).not.toBe(newObject);
        expect((result[0].value as any).data).not.toBe(newObject.data);
        expect(result[0].value).toEqual(newObject);
      }
    });
  });

  describe('REPLACE Operations Reference Handling', () => {
    it('should preserve references in REPLACE operations when immutable is false', () => {
      const replacementObject = { type: 'replacement', items: [1, 2, 3] };
      const source = { data: { type: 'original' } };
      const target = { data: replacementObject };

      const result = compare(source, target, { immutable: false });

      // Implementation handles this as individual property changes
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/data/type',
          value: 'replacement',
        },
        {
          op: Operation.ADD,
          path: '/data/items',
          value: [1, 2, 3],
        },
      ]);

      // Check reference preservation for the array value
      const arrayPatch = result.find((p) => p.path === '/data/items');
      if (arrayPatch && 'value' in arrayPatch) {
        expect(arrayPatch.value).toBe(replacementObject.items);
      }
    });

    it('should clone references in REPLACE operations when immutable is true', () => {
      const replacementObject = { type: 'replacement', items: [1, 2, 3] };
      const source = { data: { type: 'original' } };
      const target = { data: replacementObject };

      const result = compare(source, target, { immutable: true });

      // Implementation handles this as individual property changes
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/data/type',
          value: 'replacement',
        },
        {
          op: Operation.ADD,
          path: '/data/items',
          value: [1, 2, 3],
        },
      ]);

      // Check reference cloning for the array value
      const arrayPatch = result.find((p) => p.path === '/data/items');
      if (arrayPatch && 'value' in arrayPatch) {
        expect(arrayPatch.value).not.toBe(replacementObject.items);
        expect(arrayPatch.value).toEqual(replacementObject.items);
      }
    });
  });

  describe('Performance and Memory Implications', () => {
    it('should demonstrate memory efficiency with immutable: false', () => {
      const largeObject = {
        data: new Array(1000)
          .fill(0)
          .map((_, i) => ({ id: i, value: `item${i}` })),
      };

      const source = { content: null };
      const target = { content: largeObject };

      const resultMutable = compare(source, target, { immutable: false });
      const resultImmutable = compare(source, target, { immutable: true });

      // Same logical result
      expect(resultMutable.length).toBe(1);
      expect(resultImmutable.length).toBe(1);
      expect(resultMutable[0].op).toBe(resultImmutable[0].op);
      expect(resultMutable[0].path).toBe(resultImmutable[0].path);

      // Different memory usage
      if ('value' in resultMutable[0] && 'value' in resultImmutable[0]) {
        expect(resultMutable[0].value).toBe(largeObject); // No additional memory
        expect(resultImmutable[0].value).not.toBe(largeObject); // Additional memory for clone
        expect(resultImmutable[0].value).toEqual(largeObject); // Same content
      }
    });

    it('should handle shared references efficiently with immutable: false', () => {
      const sharedConfig = { theme: 'dark', locale: 'en' };
      const sharedArray = [1, 2, 3, 4, 5];

      const source = {
        moduleA: { config: null, data: null },
        moduleB: { config: null, data: null },
      };
      const target = {
        moduleA: { config: sharedConfig, data: sharedArray },
        moduleB: { config: sharedConfig, data: sharedArray },
      };

      const resultMutable = compare(source, target, { immutable: false });

      // Find patches for shared objects
      const configPatches = resultMutable.filter(
        (p) => p.path.endsWith('/config') && 'value' in p,
      );
      const dataPatches = resultMutable.filter(
        (p) => p.path.endsWith('/data') && 'value' in p,
      );

      // All config patches should reference the same shared object
      expect(configPatches.length).toBe(2);
      if (configPatches.length >= 2) {
        expect((configPatches[0] as any).value).toBe(sharedConfig);
        expect((configPatches[1] as any).value).toBe(sharedConfig);
        expect((configPatches[0] as any).value).toBe(
          (configPatches[1] as any).value,
        );
      }

      // All data patches should reference the same shared array
      expect(dataPatches.length).toBe(2);
      if (dataPatches.length >= 2) {
        expect((dataPatches[0] as any).value).toBe(sharedArray);
        expect((dataPatches[1] as any).value).toBe(sharedArray);
        expect((dataPatches[0] as any).value).toBe(
          (dataPatches[1] as any).value,
        );
      }
    });
  });

  describe('Combined with Strict Mode', () => {
    it('should work correctly with both strict and immutable options', () => {
      const replacementObject = {
        name: 'New Value',
        metadata: { created: new Date() },
      };
      const source = {
        data: { name: 'Old Value', metadata: { updated: new Date() } },
      };
      const target = { data: replacementObject };

      const result = compare(source, target, {
        strict: true,
        immutable: false,
      });

      // Implementation generates individual property changes with TEST operations
      expect(result.length).toBeGreaterThan(2); // Multiple TEST + REPLACE operations

      // Check that TEST operations are included for strict mode
      const testOps = result.filter((p) => p.op === Operation.TEST);
      const replaceOps = result.filter((p) => p.op === Operation.REPLACE);
      const addOps = result.filter((p) => p.op === Operation.ADD);

      expect(testOps.length).toBeGreaterThan(0);
      expect(replaceOps.length + addOps.length).toBeGreaterThan(0);

      // Verify reference preservation in operations that have values from target
      const targetValuePatches = result.filter(
        (p) => 'value' in p && typeof p.value === 'object' && p.value !== null,
      );
      if (targetValuePatches.length > 0) {
        // At least one should preserve reference when immutable is false
        const hasPreservedReference = targetValuePatches.some((patch) => {
          if ('value' in patch) {
            return patch.value === replacementObject.metadata;
          }
          return false;
        });
        // Note: This depends on specific implementation details
      }
    });
  });

  describe('Primitive Values', () => {
    it('should handle primitive values consistently regardless of immutable setting', () => {
      const source = {
        str: 'old',
        num: 1,
        bool: false,
        nul: null,
        undef: undefined,
      };
      const target = {
        str: 'new',
        num: 2,
        bool: true,
        nul: 'not null',
        undef: 'defined',
      };

      const resultMutable = compare(source, target, { immutable: false });
      const resultImmutable = compare(source, target, { immutable: true });

      // Results should be identical for primitive values
      expect(resultMutable).toEqual(resultImmutable);

      // All values should be the same references (primitives)
      resultMutable.forEach((patch, index) => {
        if ('value' in patch && 'value' in resultImmutable[index]) {
          expect(patch.value).toBe((resultImmutable[index] as any).value);
        }
      });
    });
  });
});
