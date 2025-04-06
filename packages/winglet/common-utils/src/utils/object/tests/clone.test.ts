import { describe, expect, it } from 'vitest';

import { clone } from '../clone';

describe('clone', () => {
  it('should clone mixed data', () => {
    const cloned = clone(mixedData);
    expect(cloned).toEqual(mixedData);
    expect(cloned).not.toBe(mixedData);
  });

  describe('Array cloning', () => {
    it('should deep clone arrays', () => {
      const original = [1, [2, 3], { a: 4 }];
      const cloned = clone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[1]).not.toBe(original[1]);
      expect(cloned[2]).not.toBe(original[2]);
    });

    it('should handle sparse arrays', () => {
      const original = new Array(3);
      original[1] = 2;
      const cloned = clone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });
  });

  describe('TypedArray cloning', () => {
    it('should deep clone TypedArrays', () => {
      const original = new Int32Array([1, 2, 3]);
      const cloned = clone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.buffer).not.toBe(original.buffer);
    });
  });

  describe('Date cloning', () => {
    it('should deep clone Date objects', () => {
      const original = new Date('2024-01-01');
      const cloned = clone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.getTime()).toBe(original.getTime());
    });
  });

  describe('RegExp cloning', () => {
    it('should deep clone RegExp objects', () => {
      const original = new RegExp('test', 'gi');
      original.lastIndex = 2;
      const cloned = clone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.lastIndex).toBe(original.lastIndex);
    });
  });

  describe('Map cloning', () => {
    it('should deep clone Map objects', () => {
      const original = new Map([
        ['key1', { value: 1 }],
        ['key2', [1, 2, 3]],
      ]);
      const cloned = clone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.get('key1')).not.toBe(original.get('key1'));
      expect(cloned.get('key2')).not.toBe(original.get('key2'));
    });
  });

  describe('Set cloning', () => {
    it('should deep clone Set objects', () => {
      const original = new Set([{ value: 1 }, [1, 2, 3]]);
      const cloned = clone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      const [first, second] = cloned;
      const [origFirst, origSecond] = original;
      expect(first).not.toBe(origFirst);
      expect(second).not.toBe(origSecond);
    });
  });

  describe('Buffer cloning', () => {
    it('should deep clone Buffer objects', () => {
      const original = Buffer.from('test');
      const cloned = clone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });
  });

  describe('ArrayBuffer cloning', () => {
    it('should deep clone ArrayBuffer objects', () => {
      const original = new ArrayBuffer(8);
      const cloned = clone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });
  });

  describe('File/Blob cloning', () => {
    it('should deep clone File objects', () => {
      const original = new File(['test'], 'test.txt', { type: 'text/plain' });
      const cloned = clone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.name).toBe(original.name);
      expect(cloned.type).toBe(original.type);
    });

    it('should deep clone Blob objects', () => {
      const original = new Blob(['test'], { type: 'text/plain' });
      const cloned = clone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.type).toBe(original.type);
    });
  });

  describe('Error cloning', () => {
    it('should deep clone Error objects', () => {
      const original = new Error('test error');
      original.stack = 'test stack';
      const cloned = clone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.message).toBe(original.message);
      expect(cloned.stack).toBe(original.stack);
    });
  });

  describe('Object cloning', () => {
    it('should deep clone plain objects', () => {
      const original = {
        a: 1,
        b: { c: 2 },
        d: [1, 2, 3],
      };
      const cloned = clone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.d).not.toBe(original.d);
    });

    it('should handle circular references', () => {
      const original: any = { a: 1 };
      original.self = original;
      const cloned = clone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.self).toBe(cloned);
    });
  });
});

const mixedData = {
  // 기본 배열
  numbers: Array.from({ length: 1000 }, (_, i) => i),
  strings: Array.from({ length: 1000 }, (_, i) => `string-${i}`),

  // TypedArray
  int8Array: new Int8Array(1000),
  uint8Array: new Uint8Array(1000),
  int16Array: new Int16Array(1000),
  uint16Array: new Uint16Array(1000),
  int32Array: new Int32Array(1000),
  uint32Array: new Uint32Array(1000),
  float32Array: new Float32Array(1000),
  float64Array: new Float64Array(1000),

  // Date 객체
  dates: Array.from(
    { length: 100 },
    (_, i) => new Date(Date.now() + i * 86400000),
  ),

  // RegExp
  regexps: [
    /^[a-zA-Z0-9]+$/,
    /^\d{3}-\d{3,4}-\d{4}$/,
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  ],

  // Map
  userMap: new Map(
    Array.from({ length: 1000 }, (_, i) => [
      `user-${i}`,
      { id: i, name: `User ${i}` },
    ]),
  ),

  // Set
  uniqueIds: new Set(Array.from({ length: 1000 }, (_, i) => `id-${i}`)),

  // Buffer
  buffer: Buffer.from('Hello, World!'.repeat(100)),

  // ArrayBuffer
  arrayBuffer: new ArrayBuffer(1000),

  // File/Blob
  blob: new Blob(['Hello, World!'.repeat(100)], { type: 'text/plain' }),

  // Error 객체들
  errors: [
    new Error('Standard Error'),
    new TypeError('Type Error'),
    new RangeError('Range Error'),
    new ReferenceError('Reference Error'),
    new SyntaxError('Syntax Error'),
  ],

  // 중첩된 객체
  nested: {
    level1: {
      level2: {
        level3: {
          level4: {
            level5: {
              value: 'deep nested value',
              array: Array.from({ length: 100 }, (_, i) => ({
                id: i,
                data: `nested-${i}`,
                date: new Date(),
                map: new Map([['key', 'value']]),
                set: new Set(['value']),
              })),
            },
          },
        },
      },
    },
  },

  // 순환 참조
  circular: (() => {
    const circular = {
      self: null as any,
      nested: {
        parent: null as any,
      },
    };
    circular.self = circular;
    circular.nested.parent = circular;
    return circular;
  })(),
};
