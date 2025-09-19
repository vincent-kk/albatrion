import { describe, expect, it } from 'vitest';

import { shallowClone } from '../shallowClone';

describe('shallowClone', () => {
  describe('Primitive values', () => {
    it('should return primitives as-is', () => {
      expect(shallowClone(42)).toBe(42);
      expect(shallowClone('hello')).toBe('hello');
      expect(shallowClone(true)).toBe(true);
      expect(shallowClone(false)).toBe(false);
      expect(shallowClone(null)).toBe(null);
      expect(shallowClone(undefined)).toBe(undefined);
    });

    it('should return symbols as-is', () => {
      const sym = Symbol('test');
      expect(shallowClone(sym)).toBe(sym);
    });

    it('should return BigInt as-is', () => {
      const bigNum = BigInt(123);
      expect(shallowClone(bigNum)).toBe(bigNum);
    });
  });

  describe('Array cloning', () => {
    it('should create a shallow copy of arrays', () => {
      const original = [1, 2, 3];
      const cloned = shallowClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('should maintain reference to nested objects in arrays', () => {
      const nested = { a: 1 };
      const original = [nested, 2, 3];
      const cloned = shallowClone(original);

      expect(cloned[0]).toBe(original[0]);
      expect(cloned[0] === nested).toBe(true);
    });

    it('should handle empty arrays', () => {
      const original: any[] = [];
      const cloned = shallowClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('should handle arrays with mixed types', () => {
      const original = [1, 'string', true, null, undefined, { key: 'value' }];
      const cloned = shallowClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[5]).toBe(original[5]);
    });

    it('should allow independent array modifications', () => {
      const original = [1, 2, 3];
      const cloned = shallowClone(original);

      cloned.push(4);
      expect(original.length).toBe(3);
      expect(cloned.length).toBe(4);
    });

    it('should handle sparse arrays', () => {
      const original = new Array(3);
      original[1] = 'middle';
      const cloned = shallowClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[1]).toBe('middle');
      expect(cloned.length).toBe(3);

      // Note: spread operator [...array] converts holes to undefined
      // This is expected behavior for shallowClone using spread
      expect(cloned[0]).toBe(undefined);
      expect(cloned[2]).toBe(undefined);
    });
  });

  describe('Object cloning', () => {
    it('should create a shallow copy of plain objects', () => {
      const original = { a: 1, b: 2, c: 3 };
      const cloned = shallowClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('should maintain reference to nested objects', () => {
      const nested = { inner: 'value' };
      const original = { a: 1, b: nested };
      const cloned = shallowClone(original);

      expect(cloned.b).toBe(original.b);
      expect(cloned.b === nested).toBe(true);
    });

    it('should handle empty objects', () => {
      const original = {};
      const cloned = shallowClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('should handle objects with mixed value types', () => {
      const func = () => 'test';
      const original = {
        num: 42,
        str: 'hello',
        bool: true,
        nil: null,
        undef: undefined,
        func: func,
        nested: { deep: 'value' }
      };
      const cloned = shallowClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.func).toBe(func);
      expect(cloned.nested).toBe(original.nested);
    });

    it('should allow independent property modifications', () => {
      const original = { a: 1, b: 2 };
      const cloned = shallowClone(original);

      cloned.a = 10;
      expect(original.a).toBe(1);
      expect(cloned.a).toBe(10);
    });

    it('should clone objects with symbol properties', () => {
      const sym = Symbol('test');
      const original = { [sym]: 'symbol value', regular: 'regular value' };
      const cloned = shallowClone(original);

      expect(cloned).not.toBe(original);
      expect(cloned[sym]).toBe('symbol value');
      expect(cloned.regular).toBe('regular value');
    });
  });

  describe('Special objects (not cloned)', () => {
    it('should return functions as-is', () => {
      const func = () => 'test';
      expect(shallowClone(func)).toBe(func);
    });

    it('should return Date objects as-is', () => {
      const date = new Date();
      expect(shallowClone(date)).toBe(date);
    });

    it('should return RegExp objects as-is', () => {
      const regex = /test/gi;
      expect(shallowClone(regex)).toBe(regex);
    });

    it('should return Map objects as-is', () => {
      const map = new Map([['key', 'value']]);
      expect(shallowClone(map)).toBe(map);
    });

    it('should return Set objects as-is', () => {
      const set = new Set([1, 2, 3]);
      expect(shallowClone(set)).toBe(set);
    });

    it('should return WeakMap objects as-is', () => {
      const weakMap = new WeakMap();
      expect(shallowClone(weakMap)).toBe(weakMap);
    });

    it('should return WeakSet objects as-is', () => {
      const weakSet = new WeakSet();
      expect(shallowClone(weakSet)).toBe(weakSet);
    });

    it('should return Error objects as-is', () => {
      const error = new Error('test error');
      expect(shallowClone(error)).toBe(error);
    });

    it('should return ArrayBuffer as-is', () => {
      const buffer = new ArrayBuffer(8);
      expect(shallowClone(buffer)).toBe(buffer);
    });

    it('should return TypedArrays as-is', () => {
      const int32Array = new Int32Array([1, 2, 3]);
      const uint8Array = new Uint8Array([1, 2, 3]);
      const float32Array = new Float32Array([1.1, 2.2, 3.3]);

      expect(shallowClone(int32Array)).toBe(int32Array);
      expect(shallowClone(uint8Array)).toBe(uint8Array);
      expect(shallowClone(float32Array)).toBe(float32Array);
    });

    it('should return DataView as-is', () => {
      const buffer = new ArrayBuffer(8);
      const dataView = new DataView(buffer);
      expect(shallowClone(dataView)).toBe(dataView);
    });

    it('should return Promise as-is', () => {
      const promise = Promise.resolve(42);
      expect(shallowClone(promise)).toBe(promise);
    });
  });

  describe('Class instances', () => {
    it('should return class instances as-is', () => {
      class TestClass {
        value: number;
        constructor(value: number) {
          this.value = value;
        }
      }

      const instance = new TestClass(42);
      expect(shallowClone(instance)).toBe(instance);
    });

    it('should return instances with custom prototype as-is', () => {
      const proto = { customMethod: () => 'test' };
      const obj = Object.create(proto);
      obj.prop = 'value';

      expect(shallowClone(obj)).toBe(obj);
    });
  });

  describe('Nested structure behavior', () => {
    it('should share nested object references after cloning', () => {
      const original = {
        level1: {
          level2: {
            value: 'deep'
          }
        }
      };
      const cloned = shallowClone(original);

      expect(cloned).not.toBe(original);
      expect(cloned.level1).toBe(original.level1);

      cloned.level1.level2.value = 'modified';
      expect(original.level1.level2.value).toBe('modified');
    });

    it('should share nested array references after cloning', () => {
      const original = [
        [1, 2, 3],
        [4, 5, 6]
      ];
      const cloned = shallowClone(original);

      expect(cloned).not.toBe(original);
      expect(cloned[0]).toBe(original[0]);
      expect(cloned[1]).toBe(original[1]);

      cloned[0].push(4);
      expect(original[0].length).toBe(4);
    });

    it('should handle mixed nested structures', () => {
      const original = {
        array: [1, { nested: true }],
        object: { inner: [1, 2, 3] }
      };
      const cloned = shallowClone(original);

      expect(cloned).not.toBe(original);
      expect(cloned.array).toBe(original.array);
      expect(cloned.object).toBe(original.object);
    });
  });

  describe('Edge cases', () => {
    it('should handle objects with null prototype', () => {
      const original = Object.create(null);
      original.a = 1;
      original.b = 2;
      const cloned = shallowClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('should handle objects with numeric string keys', () => {
      const original = { '0': 'zero', '1': 'one', '2': 'two' };
      const cloned = shallowClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('should handle objects with special property names', () => {
      const original = {
        'special-key': 'value1',
        'key with spaces': 'value2',
        '': 'empty key',
        '123': 'numeric key'
      };
      const cloned = shallowClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('should preserve property enumeration order', () => {
      const original = { z: 1, a: 2, m: 3 };
      const cloned = shallowClone(original);

      expect(Object.keys(cloned)).toEqual(Object.keys(original));
    });
  });

  describe('Type preservation', () => {
    it('should preserve array type', () => {
      const original: number[] = [1, 2, 3];
      const cloned = shallowClone(original);

      expect(Array.isArray(cloned)).toBe(true);
    });

    it('should preserve object type', () => {
      const original: { [key: string]: number } = { a: 1, b: 2 };
      const cloned = shallowClone(original);

      expect(typeof cloned).toBe('object');
      expect(cloned).not.toBe(null);
    });
  });

  describe('Performance-related patterns', () => {
    it('should handle large arrays efficiently', () => {
      const original = Array.from({ length: 1000 }, (_, i) => i);
      const cloned = shallowClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('should handle objects with many properties efficiently', () => {
      const original: Record<string, number> = {};
      for (let i = 0; i < 1000; i++) {
        original[`key${i}`] = i;
      }
      const cloned = shallowClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });
  });
});