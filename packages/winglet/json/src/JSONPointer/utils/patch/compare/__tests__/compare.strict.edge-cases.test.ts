import { describe, expect, it } from 'vitest';

import { Operation } from '../../../patchModel';
import { compare } from '../compare';

describe('compare - strict mode', () => {
  describe('Edge Cases and Potential Issues', () => {
    describe('Nested Type Mismatch', () => {
      it('should handle type mismatch in nested object property', () => {
        const source = {
          user: {
            data: [1, 2, 3],
            id: 'user1',
          },
        };
        const target = {
          user: {
            data: { count: 3 },
            id: 'user1',
          },
        };

        const result = compare(source, target, { strict: true });

        expect(result).toEqual([
          { op: Operation.TEST, path: '/user/data', value: [1, 2, 3] },
          { op: Operation.REPLACE, path: '/user/data', value: { count: 3 } },
        ]);
      });

      it('should handle multiple nested type mismatches', () => {
        const source = {
          level1: {
            level2: {
              arrayData: [1, 2, 3],
              objectData: { key: 'value' },
            },
          },
        };
        const target = {
          level1: {
            level2: {
              arrayData: { count: 3 },
              objectData: ['item1', 'item2'],
            },
          },
        };

        const result = compare(source, target, { strict: true });

        expect(result).toEqual([
          {
            op: Operation.TEST,
            path: '/level1/level2/arrayData',
            value: [1, 2, 3],
          },
          {
            op: Operation.REPLACE,
            path: '/level1/level2/arrayData',
            value: { count: 3 },
          },
          {
            op: Operation.TEST,
            path: '/level1/level2/objectData',
            value: { key: 'value' },
          },
          {
            op: Operation.REPLACE,
            path: '/level1/level2/objectData',
            value: ['item1', 'item2'],
          },
        ]);
      });

      it('should handle partial type mismatch in nested structure', () => {
        const source = {
          user: {
            profile: { name: 'John', age: 30 },
            settings: [1, 2, 3],
          },
          system: { version: '1.0' },
        };
        const target = {
          user: {
            profile: { name: 'John', age: 31 }, // age changed
            settings: { theme: 'dark' }, // type mismatch: array → object
          },
          system: { version: '1.0' },
        };

        const result = compare(source, target, { strict: true });

        expect(result).toEqual([
          { op: Operation.TEST, path: '/user/profile/age', value: 30 },
          { op: Operation.REPLACE, path: '/user/profile/age', value: 31 },
          { op: Operation.TEST, path: '/user/settings', value: [1, 2, 3] },
          {
            op: Operation.REPLACE,
            path: '/user/settings',
            value: { theme: 'dark' },
          },
        ]);
      });
    });

    describe('Array Element Type Mismatch', () => {
      it('should handle type mismatch in array elements', () => {
        const source = [{ id: 1, name: 'John' }, [1, 2, 3], 'stringValue'];
        const target = [
          { id: 1, name: 'John' },
          { count: 3 }, // array → object
          'stringValue',
        ];

        const result = compare(source, target, { strict: true });

        expect(result).toEqual([
          { op: Operation.TEST, path: '/1', value: [1, 2, 3] },
          { op: Operation.REPLACE, path: '/1', value: { count: 3 } },
        ]);
      });

      it('should handle mixed type array with multiple mismatches', () => {
        const source = [{ type: 'object' }, [1, 2, 3], 'string', null];
        const target = [
          ['new', 'array'], // object → array
          { newObject: true }, // array → object
          { converted: 'string' }, // string → object
          null,
        ];

        const result = compare(source, target, { strict: true });

        expect(result).toEqual([
          { op: Operation.TEST, path: '/0', value: { type: 'object' } },
          { op: Operation.REPLACE, path: '/0', value: ['new', 'array'] },
          { op: Operation.TEST, path: '/1', value: [1, 2, 3] },
          { op: Operation.REPLACE, path: '/1', value: { newObject: true } },
          { op: Operation.TEST, path: '/2', value: 'string' },
          { op: Operation.REPLACE, path: '/2', value: { converted: 'string' } },
        ]);
      });

      it('should handle array size change with type mismatch', () => {
        const source = ['item1', [1, 2, 3], 'item3'];
        const target = [
          'item1',
          { count: 3 }, // type mismatch
          'item3',
          'newItem', // array size increased
        ];

        const result = compare(source, target, { strict: true });

        expect(result).toEqual([
          { op: Operation.TEST, path: '/1', value: [1, 2, 3] },
          { op: Operation.REPLACE, path: '/1', value: { count: 3 } },
          { op: Operation.ADD, path: '/3', value: 'newItem' },
        ]);
      });
    });

    describe('Null and Undefined Handling', () => {
      it('should handle null to non-null type mismatch', () => {
        const source = {
          data: null,
          list: null,
        };
        const target = {
          data: { id: 1, name: 'Test' },
          list: [1, 2, 3],
        };

        const result = compare(source, target, { strict: true });

        expect(result).toEqual([
          { op: Operation.TEST, path: '/data', value: null },
          {
            op: Operation.REPLACE,
            path: '/data',
            value: { id: 1, name: 'Test' },
          },
          { op: Operation.TEST, path: '/list', value: null },
          { op: Operation.REPLACE, path: '/list', value: [1, 2, 3] },
        ]);
      });

      it('should handle non-null to null type mismatch', () => {
        const source = {
          complexObject: { deeply: { nested: { value: 42 } } },
          arrayData: [1, 2, { inner: 'object' }],
        };
        const target = {
          complexObject: null,
          arrayData: null,
        };

        const result = compare(source, target, { strict: true });

        expect(result).toEqual([
          {
            op: Operation.TEST,
            path: '/complexObject',
            value: { deeply: { nested: { value: 42 } } },
          },
          { op: Operation.REPLACE, path: '/complexObject', value: null },
          {
            op: Operation.TEST,
            path: '/arrayData',
            value: [1, 2, { inner: 'object' }],
          },
          { op: Operation.REPLACE, path: '/arrayData', value: null },
        ]);
      });
    });

    describe('Empty Structures', () => {
      it('should handle empty object to non-empty object', () => {
        const source = { data: {} };
        const target = { data: { name: 'John', age: 30 } };

        const result = compare(source, target, { strict: true });

        // ADD 연산 전에는 TEST 연산이 없는 것이 정상입니다
        expect(result).toEqual([
          { op: Operation.ADD, path: '/data/name', value: 'John' },
          { op: Operation.ADD, path: '/data/age', value: 30 },
        ]);
      });

      it('should handle empty array to non-empty array', () => {
        const source = { list: [] };
        const target = { list: [1, 2, 3] };

        const result = compare(source, target, { strict: true });

        // ADD 연산 전에는 TEST 연산이 없는 것이 정상입니다
        expect(result).toEqual([
          { op: Operation.ADD, path: '/list/0', value: 1 },
          { op: Operation.ADD, path: '/list/1', value: 2 },
          { op: Operation.ADD, path: '/list/2', value: 3 },
        ]);
      });

      it('should handle empty to empty with different types', () => {
        const source = {
          emptyObj: {},
          emptyArr: [],
          emptyStr: '',
        };
        const target = {
          emptyObj: [], // {} → []
          emptyArr: {}, // [] → {}
          emptyStr: null, // '' → null
        };

        const result = compare(source, target, { strict: true });

        expect(result).toEqual([
          { op: Operation.TEST, path: '/emptyObj', value: {} },
          { op: Operation.REPLACE, path: '/emptyObj', value: [] },
          { op: Operation.TEST, path: '/emptyArr', value: [] },
          { op: Operation.REPLACE, path: '/emptyArr', value: {} },
          { op: Operation.TEST, path: '/emptyStr', value: '' },
          { op: Operation.REPLACE, path: '/emptyStr', value: null },
        ]);
      });
    });

    describe('Deep Nesting and Path Calculation', () => {
      it('should handle deep nested type mismatch', () => {
        const source = {
          level1: {
            level2: {
              level3: {
                level4: {
                  level5: {
                    data: [1, 2, 3],
                  },
                },
              },
            },
          },
        };
        const target = {
          level1: {
            level2: {
              level3: {
                level4: {
                  level5: {
                    data: { count: 3 },
                  },
                },
              },
            },
          },
        };

        const result = compare(source, target, { strict: true });

        expect(result).toEqual([
          {
            op: Operation.TEST,
            path: '/level1/level2/level3/level4/level5/data',
            value: [1, 2, 3],
          },
          {
            op: Operation.REPLACE,
            path: '/level1/level2/level3/level4/level5/data',
            value: { count: 3 },
          },
        ]);
      });

      it('should handle array path with special characters in object keys', () => {
        const source = {
          'key/with/slashes': [1, 2, 3],
          'key~with~tildes': { data: 'test' },
        };
        const target = {
          'key/with/slashes': { count: 3 },
          'key~with~tildes': ['item1', 'item2'],
        };

        const result = compare(source, target, { strict: true });

        // JSON Pointer escaping: '/' becomes '~1', '~' becomes '~0'
        expect(result).toEqual([
          { op: Operation.TEST, path: '/key~1with~1slashes', value: [1, 2, 3] },
          {
            op: Operation.REPLACE,
            path: '/key~1with~1slashes',
            value: { count: 3 },
          },
          {
            op: Operation.TEST,
            path: '/key~0with~0tildes',
            value: { data: 'test' },
          },
          {
            op: Operation.REPLACE,
            path: '/key~0with~0tildes',
            value: ['item1', 'item2'],
          },
        ]);
      });
    });

    describe('Large Data Structures', () => {
      it('should handle large object with type mismatch', () => {
        // Create objects with many properties
        const sourceObj: Record<string, any> = {};
        const targetObj: Record<string, any> = {};

        for (let i = 0; i < 50; i++) {
          sourceObj[`prop${i}`] = i;
          targetObj[`prop${i}`] = i;
        }

        // Add one type mismatch
        sourceObj.problematicProp = [1, 2, 3];
        targetObj.problematicProp = { count: 3 };

        const source = { largeObj: sourceObj };
        const target = { largeObj: targetObj };

        const result = compare(source, target, { strict: true });

        // Should only have operations for the mismatched property
        expect(result).toEqual([
          {
            op: Operation.TEST,
            path: '/largeObj/problematicProp',
            value: [1, 2, 3],
          },
          {
            op: Operation.REPLACE,
            path: '/largeObj/problematicProp',
            value: { count: 3 },
          },
        ]);
      });

      it('should handle large array with type mismatch', () => {
        const sourceArray = new Array(100).fill(0).map((_, i) => i);
        const targetArray = [...sourceArray];

        // Change one element to different type
        (targetArray as any[])[50] = { index: 50 };

        const source = { largeArray: sourceArray };
        const target = { largeArray: targetArray };

        const result = compare(source, target, { strict: true });

        expect(result).toEqual([
          { op: Operation.TEST, path: '/largeArray/50', value: 50 },
          {
            op: Operation.REPLACE,
            path: '/largeArray/50',
            value: { index: 50 },
          },
        ]);
      });
    });
  });
});
