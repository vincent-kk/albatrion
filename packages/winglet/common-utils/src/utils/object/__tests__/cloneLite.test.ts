import { describe, expect, it } from 'vitest';

import { cloneLite } from '../cloneLite';

describe('cloneLite', () => {
  describe('Primitive cloning', () => {
    it('should return primitives as-is', () => {
      expect(cloneLite(42)).toBe(42);
      expect(cloneLite('hello')).toBe('hello');
      expect(cloneLite(true)).toBe(true);
      expect(cloneLite(null)).toBe(null);
      expect(cloneLite(undefined)).toBe(undefined);

      const sym = Symbol('test');
      expect(cloneLite(sym)).toBe(sym);

      const bigInt = BigInt(9007199254740991);
      expect(cloneLite(bigInt)).toBe(bigInt);
    });
  });

  describe('Array cloning', () => {
    it('should deep clone arrays', () => {
      const original = [1, [2, 3], { a: 4 }];
      const cloned = cloneLite(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[1]).not.toBe(original[1]);
      expect(cloned[2]).not.toBe(original[2]);
    });

    it('should handle sparse arrays', () => {
      const original = new Array(3);
      original[1] = 2;
      const cloned = cloneLite(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.length).toBe(3);
      expect(0 in cloned).toBe(false);
      expect(1 in cloned).toBe(true);
      expect(2 in cloned).toBe(false);
    });
  });

  describe('Object cloning', () => {
    it('should deep clone plain objects', () => {
      const original = {
        a: 1,
        b: { c: 2 },
        d: [1, 2, 3],
      };
      const cloned = cloneLite(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.d).not.toBe(original.d);
    });

    it('should clone Object.create(null) objects', () => {
      const original = Object.create(null);
      original.a = 1;
      original.b = { c: 2 };

      const cloned = cloneLite(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
    });

    it('should handle nested plain objects', () => {
      const original = {
        level1: {
          level2: {
            level3: {
              value: 'deep',
              array: [1, 2, 3],
            },
          },
        },
      };
      const cloned = cloneLite(original);

      expect(cloned).toEqual(original);
      expect(cloned.level1.level2.level3).not.toBe(
        original.level1.level2.level3,
      );
      expect(cloned.level1.level2.level3.array).not.toBe(
        original.level1.level2.level3.array,
      );
    });
  });

  describe('Unsupported types (returned as-is)', () => {
    it('should return Date objects as-is', () => {
      const original = new Date('2024-01-01');
      const cloned = cloneLite(original);

      expect(cloned).toBe(original);
    });

    it('should return RegExp objects as-is', () => {
      const original = /test/gi;
      const cloned = cloneLite(original);

      expect(cloned).toBe(original);
    });

    it('should return Map objects as-is', () => {
      const original = new Map([['key', 'value']]);
      const cloned = cloneLite(original);

      expect(cloned).toBe(original);
    });

    it('should return Set objects as-is', () => {
      const original = new Set([1, 2, 3]);
      const cloned = cloneLite(original);

      expect(cloned).toBe(original);
    });

    it('should return functions as-is', () => {
      const original = () => 'test';
      const cloned = cloneLite(original);

      expect(cloned).toBe(original);
    });

    it('should return class instances as-is', () => {
      class TestClass {
        value = 42;
      }
      const original = new TestClass();
      const cloned = cloneLite(original);

      expect(cloned).toBe(original);
    });

    it('should return Error objects as-is', () => {
      const original = new Error('test');
      const cloned = cloneLite(original);

      expect(cloned).toBe(original);
    });
  });

  describe('Mixed data structures', () => {
    it('should clone only supported types deeply', () => {
      const date = new Date('2024-01-01');
      const regex = /test/gi;
      const fn = () => 'test';

      const original = {
        primitives: {
          num: 42,
          str: 'hello',
          bool: true,
          nil: null,
          undef: undefined,
        },
        arrays: [
          [1, 2],
          [3, 4],
        ],
        objects: { nested: { value: 'deep' } },
        unsupported: {
          date,
          regex,
          fn,
          map: new Map([['key', 'value']]),
        },
      };

      const cloned = cloneLite(original);

      expect(cloned).toEqual(original);

      // Supported types should be cloned
      expect(cloned).not.toBe(original);
      expect(cloned.primitives).not.toBe(original.primitives);
      expect(cloned.arrays).not.toBe(original.arrays);
      expect(cloned.arrays[0]).not.toBe(original.arrays[0]);
      expect(cloned.objects.nested).not.toBe(original.objects.nested);

      // Unsupported types should be same reference
      expect(cloned.unsupported.date).toBe(date);
      expect(cloned.unsupported.regex).toBe(regex);
      expect(cloned.unsupported.fn).toBe(fn);
      expect(cloned.unsupported.map).toBe(original.unsupported.map);
    });
  });

  describe('Performance characteristics', () => {
    it('should handle large simple structures efficiently', () => {
      const original = {
        users: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `user_${i}`,
          active: i % 2 === 0,
          scores: [Math.random() * 100, Math.random() * 100],
        })),
      };

      const start = performance.now();
      const cloned = cloneLite(original);
      const end = performance.now();

      expect(cloned).toEqual(original);
      expect(cloned.users).not.toBe(original.users);

      // Should be very fast (typically < 5ms for 1000 items)
      expect(end - start).toBeLessThan(10);
    });
  });

  describe('maxDepth parameter', () => {
    it('should limit cloning depth for arrays and objects', () => {
      const original = {
        level1: {
          level2: {
            level3: {
              level4: 'deep value',
            },
            array: [1, [2, [3]]],
          },
        },
      };

      // maxDepth = 0: returns reference
      const depth0 = cloneLite(original, 0);
      expect(depth0).toBe(original);

      // maxDepth = 1: clones only first level
      const depth1 = cloneLite(original, 1);
      expect(depth1).not.toBe(original);
      expect(depth1.level1).toBe(original.level1);

      // maxDepth = 2: clones two levels
      const depth2 = cloneLite(original, 2);
      expect(depth2).not.toBe(original);
      expect(depth2.level1).not.toBe(original.level1);
      expect(depth2.level1.level2).toBe(original.level1.level2);

      // maxDepth = 3: clones three levels
      const depth3 = cloneLite(original, 3);
      expect(depth3).not.toBe(original);
      expect(depth3.level1).not.toBe(original.level1);
      expect(depth3.level1.level2).not.toBe(original.level1.level2);
      expect(depth3.level1.level2.level3).toBe(original.level1.level2.level3);
    });

    it('should handle nested arrays with maxDepth', () => {
      const original = [1, [2, [3, [4]]]];

      const depth1 = cloneLite(original, 1);
      expect(depth1).not.toBe(original);
      expect(depth1[1]).toBe(original[1]);

      const depth2 = cloneLite(original, 2);
      expect(depth2).not.toBe(original);
      expect(depth2[1]).not.toBe(original[1]);
      expect((depth2[1] as any[])[1]).toBe((original[1] as any[])[1]);
    });

    it('should return unsupported types as-is regardless of maxDepth', () => {
      const date = new Date();
      const map = new Map();
      const original = {
        level1: {
          date,
          map,
          level2: {
            regex: /test/,
          },
        },
      };

      const cloned = cloneLite(original, 2);
      expect(cloned).not.toBe(original);
      expect(cloned.level1).not.toBe(original.level1);
      expect(cloned.level1.level2).toBe(original.level1.level2); // stopped at depth 2
      // Unsupported types are always returned as-is
      expect(cloned.level1.date).toBe(date);
      expect(cloned.level1.map).toBe(map);
    });

    it('should work without maxDepth parameter (backward compatibility)', () => {
      const original = {
        level1: {
          level2: {
            level3: {
              value: 'deep',
            },
          },
        },
      };

      const cloned = cloneLite(original);
      expect(cloned).not.toBe(original);
      expect(cloned.level1).not.toBe(original.level1);
      expect(cloned.level1.level2).not.toBe(original.level1.level2);
      expect(cloned.level1.level2.level3).not.toBe(
        original.level1.level2.level3,
      );
      expect(cloned.level1.level2.level3.value).toBe('deep');
    });

    it('should efficiently handle large structures with limited depth', () => {
      const createDeepStructure = (depth: number): any => {
        if (depth === 0) return { value: 'leaf' };
        return {
          left: createDeepStructure(depth - 1),
          right: createDeepStructure(depth - 1),
          data: Array(10)
            .fill(0)
            .map((_, i) => i),
        };
      };

      const original = createDeepStructure(10); // Very deep structure

      // Clone only top 3 levels
      const start = performance.now();
      const cloned = cloneLite(original, 3);
      const end = performance.now();

      // Should be very fast since we limit depth
      expect(end - start).toBeLessThan(5);

      // Verify structure
      expect(cloned).not.toBe(original);
      expect(cloned.left).not.toBe(original.left);
      expect(cloned.left.left).not.toBe(original.left.left);
      expect(cloned.left.left.left).toBe(original.left.left.left); // reference from depth 4
    });
  });

  describe('Edge cases', () => {
    it('should not copy symbol properties', () => {
      const sym = Symbol('test');
      const original = {
        regular: 'value',
        [sym]: 'symbol value',
      };

      const cloned = cloneLite(original);

      expect(cloned.regular).toBe('value');
      expect(cloned[sym]).toBeUndefined();
    });

    it('should not clone objects with custom prototypes', () => {
      const proto = { inherited: 'value' };
      const original = Object.create(proto);
      original.own = 'property';

      const cloned = cloneLite(original);

      // Should return as-is since it's not a plain object
      expect(cloned).toBe(original);
    });

    // Note: We don't test circular references because they cause stack overflow
    // This is a documented limitation of cloneLite
  });
});
