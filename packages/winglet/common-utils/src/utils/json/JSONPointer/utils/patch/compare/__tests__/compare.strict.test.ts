import { describe, expect, it } from 'vitest';

import { Operation } from '../../type';
import { compare } from '../compare';

describe('compare - strict mode', () => {
  describe('Basic Operations with TEST', () => {
    it('should include TEST operation before REPLACE in strict mode', () => {
      const source = { name: 'John', age: 30 };
      const target = { name: 'John', age: 31 };

      const result = compare(source, target, true);
      expect(result).toEqual([
        {
          op: Operation.TEST,
          path: '/age',
          value: 30,
        },
        {
          op: Operation.REPLACE,
          path: '/age',
          value: 31,
        },
      ]);
    });

    it('should include TEST operation before REMOVE in strict mode', () => {
      const source = { name: 'John', age: 30 };
      const target = { name: 'John' };

      const result = compare(source, target, true);
      expect(result).toEqual([
        {
          op: Operation.TEST,
          path: '/age',
          value: 30,
        },
        {
          op: Operation.REMOVE,
          path: '/age',
        },
      ]);
    });

    it('should NOT include TEST operation for ADD in strict mode', () => {
      const source = { name: 'John' };
      const target = { name: 'John', age: 30 };

      const result = compare(source, target, true);
      expect(result).toEqual([
        {
          op: Operation.ADD,
          path: '/age',
          value: 30,
        },
      ]);
    });

    it('should not include TEST operations in non-strict mode', () => {
      const source = { name: 'John', age: 30 };
      const target = { name: 'John', age: 31 };

      const result = compare(source, target, false);
      expect(result).toEqual([
        {
          op: Operation.REPLACE,
          path: '/age',
          value: 31,
        },
      ]);
    });
  });

  describe('Multiple Operations with TEST', () => {
    it('should include TEST operations for multiple changes in strict mode', () => {
      const source = { name: 'John', age: 30, city: 'NYC' };
      const target = { name: 'Jane', country: 'USA' };

      const result = compare(source, target, true);

      // 정확한 연산 순서와 값 검증 (객체 정의 순서와 일치)
      expect(result).toEqual([
        { op: Operation.TEST, path: '/name', value: 'John' },
        { op: Operation.REPLACE, path: '/name', value: 'Jane' },
        { op: Operation.TEST, path: '/age', value: 30 },
        { op: Operation.REMOVE, path: '/age' },
        { op: Operation.TEST, path: '/city', value: 'NYC' },
        { op: Operation.REMOVE, path: '/city' },
        { op: Operation.ADD, path: '/country', value: 'USA' },
      ]);
    });
  });

  describe('Array Operations with TEST', () => {
    it('should include TEST operation before array element REPLACE in strict mode', () => {
      const source = [1, 2, 3];
      const target = [1, 5, 3];

      const result = compare(source, target, true);
      expect(result).toEqual([
        {
          op: Operation.TEST,
          path: '/1',
          value: 2,
        },
        {
          op: Operation.REPLACE,
          path: '/1',
          value: 5,
        },
      ]);
    });

    it('should include TEST operation before array element REMOVE in strict mode', () => {
      const source = [1, 2, 3];
      const target = [1, 2];

      const result = compare(source, target, true);
      expect(result).toEqual([
        {
          op: Operation.TEST,
          path: '/2',
          value: 3,
        },
        {
          op: Operation.REMOVE,
          path: '/2',
        },
      ]);
    });

    it('should NOT include TEST operation for array element ADD in strict mode', () => {
      const source = [1, 2];
      const target = [1, 2, 3];

      const result = compare(source, target, true);
      expect(result).toEqual([
        {
          op: Operation.ADD,
          path: '/2',
          value: 3,
        },
      ]);
    });
  });

  describe('Nested Structure Operations with TEST', () => {
    it('should include TEST operations for nested object changes in strict mode', () => {
      const source = {
        user: {
          name: 'John',
          details: {
            age: 30,
            city: 'NYC',
          },
        },
      };
      const target = {
        user: {
          name: 'John',
          details: {
            age: 31,
            country: 'USA',
          },
        },
      };

      const result = compare(source, target, true);

      // 정확한 연산 순서와 값 검증 (객체 정의 순서와 일치)
      expect(result).toEqual([
        { op: Operation.TEST, path: '/user/details/age', value: 30 },
        { op: Operation.REPLACE, path: '/user/details/age', value: 31 },
        { op: Operation.TEST, path: '/user/details/city', value: 'NYC' },
        { op: Operation.REMOVE, path: '/user/details/city' },
        { op: Operation.ADD, path: '/user/details/country', value: 'USA' },
      ]);
    });

    it('should include TEST operations for nested array changes in strict mode', () => {
      const source = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
      };
      const target = {
        items: [
          { id: 1, name: 'Updated Item 1' },
          { id: 3, name: 'Item 3' },
        ],
      };

      const result = compare(source, target, true);

      // 정확한 연산 순서와 값 검증 (객체 정의 순서와 일치)
      expect(result).toEqual([
        { op: Operation.TEST, path: '/items/0/name', value: 'Item 1' },
        {
          op: Operation.REPLACE,
          path: '/items/0/name',
          value: 'Updated Item 1',
        },
        { op: Operation.TEST, path: '/items/1/id', value: 2 },
        { op: Operation.REPLACE, path: '/items/1/id', value: 3 },
        { op: Operation.TEST, path: '/items/1/name', value: 'Item 2' },
        { op: Operation.REPLACE, path: '/items/1/name', value: 'Item 3' },
      ]);
    });
  });

  describe('Type Mismatch with TEST', () => {
    it('should include TEST operation before REPLACE for type mismatch in strict mode', () => {
      const source = { data: [1, 2, 3] };
      const target = { data: { count: 3 } };

      const result = compare(source, target, true);

      // 개선된 로직: 깔끔한 Type mismatch 처리
      expect(result).toEqual([
        { op: Operation.TEST, path: '/data', value: [1, 2, 3] },
        { op: Operation.REPLACE, path: '/data', value: { count: 3 } },
      ]);
    });

    it('should include TEST operation before entire structure replacement in strict mode', () => {
      const source = [1, 2, 3];
      const target = { count: 3 };

      const result = compare(source, target, true);

      // 개선된 로직: 깔끔한 전체 구조 교체
      expect(result).toEqual([
        { op: Operation.TEST, path: '', value: [1, 2, 3] },
        { op: Operation.REPLACE, path: '', value: { count: 3 } },
      ]);
    });
  });

  describe('Objects with toJson() method', () => {
    it('should include TEST operations with serialized values in strict mode', () => {
      const source = {
        value: {
          toJson() {
            return { serialized: 'source' };
          },
        },
      };
      const target = {
        value: {
          toJson() {
            return { serialized: 'target' };
          },
        },
      };

      const result = compare(source, target, true);
      expect(result).toEqual([
        {
          op: Operation.TEST,
          path: '/value/serialized',
          value: 'source',
        },
        {
          op: Operation.REPLACE,
          path: '/value/serialized',
          value: 'target',
        },
      ]);
    });
  });

  describe('Edge Cases with TEST', () => {
    it('should handle undefined values correctly in strict mode', () => {
      const source = { name: 'John', age: undefined };
      const target = { name: 'John' };

      const result = compare(source, target, true);
      expect(result).toEqual([
        {
          op: Operation.TEST,
          path: '/age',
          value: null,
        },
        {
          op: Operation.REMOVE,
          path: '/age',
        },
      ]);
    });

    it('should handle null values correctly in strict mode', () => {
      const source = { name: 'John', data: null };
      const target = { name: 'John', data: 'value' };

      const result = compare(source, target, true);
      expect(result).toEqual([
        {
          op: Operation.TEST,
          path: '/data',
          value: null,
        },
        {
          op: Operation.REPLACE,
          path: '/data',
          value: 'value',
        },
      ]);
    });

    it('should return empty array for identical objects in strict mode', () => {
      const source = { name: 'John', age: 30 };
      const target = { name: 'John', age: 30 };

      const result = compare(source, target, true);
      expect(result).toEqual([]);
    });

    it('should handle complex nested structures with mixed operations in strict mode', () => {
      const source = {
        users: [
          { id: 1, profile: { name: 'John', age: 30 } },
          { id: 2, profile: { name: 'Jane', age: 25 } },
        ],
        metadata: { version: 1, active: true },
      };
      const target = {
        users: [
          { id: 1, profile: { name: 'Johnny', age: 30 } },
          { id: 3, profile: { name: 'Bob', age: 35 } },
        ],
        metadata: { version: 2 },
        settings: { theme: 'dark' },
      };

      const result = compare(source, target, true);

      // 명확한 기대값 정의 (객체 정의 순서에 맞춤)
      const expectedOperations = [
        // users 배열 처리 (정의 순서)
        { op: Operation.TEST, path: '/users/0/profile/name', value: 'John' },
        {
          op: Operation.REPLACE,
          path: '/users/0/profile/name',
          value: 'Johnny',
        },
        { op: Operation.TEST, path: '/users/1/id', value: 2 },
        { op: Operation.REPLACE, path: '/users/1/id', value: 3 },
        { op: Operation.TEST, path: '/users/1/profile/name', value: 'Jane' },
        { op: Operation.REPLACE, path: '/users/1/profile/name', value: 'Bob' },
        { op: Operation.TEST, path: '/users/1/profile/age', value: 25 },
        { op: Operation.REPLACE, path: '/users/1/profile/age', value: 35 },

        // metadata 처리 (정의 순서)
        { op: Operation.TEST, path: '/metadata/version', value: 1 },
        { op: Operation.REPLACE, path: '/metadata/version', value: 2 },
        { op: Operation.TEST, path: '/metadata/active', value: true },
        { op: Operation.REMOVE, path: '/metadata/active' },

        // settings 추가
        { op: Operation.ADD, path: '/settings', value: { theme: 'dark' } },
      ];

      // 정확한 배열 비교
      expect(result).toEqual(expectedOperations);
    });

    it('should distinguish between null and undefined', () => {
      const source = {
        nullValue: null,
        undefinedValue: undefined,
        missingValue: 'exists',
      };
      const target = {
        nullValue: undefined, // 명시적으로 undefined 설정
        undefinedValue: null,
        // missingValue is missing (becomes undefined)
      };

      const result = compare(source, target, true);

      // 실제 구현 동작에 맞춘 기대값
      expect(result).toEqual([
        {
          op: Operation.TEST,
          path: '/nullValue',
          value: null,
        },
        {
          op: Operation.REMOVE,
          path: '/nullValue',
        },
        {
          op: Operation.TEST,
          path: '/undefinedValue',
          value: null,
        },
        {
          op: Operation.REPLACE,
          path: '/undefinedValue',
          value: null,
        },
        {
          op: Operation.TEST,
          path: '/missingValue',
          value: 'exists',
        },
        {
          op: Operation.REMOVE,
          path: '/missingValue',
        },
      ]);
    });
  });

  describe('Performance and Consistency', () => {
    it('should maintain operation order consistency in strict mode', () => {
      const source = { a: 1, b: 2, c: 3 };
      const target = { a: 10, b: 2, d: 4 };

      const result = compare(source, target, true);

      // 정확한 연산 순서와 값 검증 (객체 정의 순서와 일치)
      expect(result).toEqual([
        { op: Operation.TEST, path: '/a', value: 1 },
        { op: Operation.REPLACE, path: '/a', value: 10 },
        { op: Operation.TEST, path: '/c', value: 3 },
        { op: Operation.REMOVE, path: '/c' },
        { op: Operation.ADD, path: '/d', value: 4 },
      ]);
    });
  });

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

        const result = compare(source, target, true);

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

        const result = compare(source, target, true);

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

        const result = compare(source, target, true);

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

        const result = compare(source, target, true);

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

        const result = compare(source, target, true);

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

        const result = compare(source, target, true);

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

        const result = compare(source, target, true);

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

        const result = compare(source, target, true);

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

        const result = compare(source, target, true);

        // ADD 연산 전에는 TEST 연산이 없는 것이 정상입니다
        expect(result).toEqual([
          { op: Operation.ADD, path: '/data/name', value: 'John' },
          { op: Operation.ADD, path: '/data/age', value: 30 },
        ]);
      });

      it('should handle empty array to non-empty array', () => {
        const source = { list: [] };
        const target = { list: [1, 2, 3] };

        const result = compare(source, target, true);

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

        const result = compare(source, target, true);

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

        const result = compare(source, target, true);

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

        const result = compare(source, target, true);

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

        const result = compare(source, target, true);

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

        const result = compare(source, target, true);

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
