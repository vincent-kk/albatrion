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

  describe('maxDepth parameter', () => {
    it('should limit cloning depth when maxDepth is specified', () => {
      const original = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: 'deep value',
              },
              array: [1, [2, [3, [4, [5]]]]],
            },
          },
        },
      };

      // maxDepth = 0: returns reference
      const depth0 = clone(original, 0);
      expect(depth0).toBe(original);

      // maxDepth = 1: clones only first level
      const depth1 = clone(original, 1);
      expect(depth1).not.toBe(original);
      expect(depth1.level1).toBe(original.level1); // reference from depth 2

      // maxDepth = 2: clones two levels
      const depth2 = clone(original, 2);
      expect(depth2).not.toBe(original);
      expect(depth2.level1).not.toBe(original.level1);
      expect(depth2.level1.level2).toBe(original.level1.level2); // reference from depth 3

      // maxDepth = 3: clones three levels
      const depth3 = clone(original, 3);
      expect(depth3).not.toBe(original);
      expect(depth3.level1).not.toBe(original.level1);
      expect(depth3.level1.level2).not.toBe(original.level1.level2);
      expect(depth3.level1.level2.level3).toBe(original.level1.level2.level3); // reference from depth 4
    });

    it('should apply maxDepth to arrays', () => {
      const original = [1, [2, [3, [4, [5]]]]];

      const depth1 = clone(original, 1);
      expect(depth1).not.toBe(original);
      expect(depth1[1]).toBe(original[1]); // reference from depth 2

      const depth2 = clone(original, 2);
      expect(depth2).not.toBe(original);
      expect(depth2[1]).not.toBe(original[1]);
      expect((depth2[1] as any[])[1]).toBe((original[1] as any[])[1]); // reference from depth 3
    });

    it('should apply maxDepth to Map and Set', () => {
      const innerObj = { deep: { value: 42 } };
      const originalMap = new Map([['key', innerObj]]);
      const originalSet = new Set([innerObj]);

      // Map with maxDepth = 2
      const clonedMap = clone(originalMap, 2);
      expect(clonedMap).not.toBe(originalMap);
      const mapValue = clonedMap.get('key');
      expect(mapValue).not.toBe(innerObj);
      expect(mapValue?.deep).toStrictEqual(innerObj?.deep); // reference from depth 3

      // Set with maxDepth = 2
      const clonedSet = clone(originalSet, 2);
      expect(clonedSet).not.toBe(originalSet);
      const [setValue] = clonedSet;
      expect(setValue).not.toBe(innerObj);
      expect(setValue.deep).toBe(innerObj.deep); // reference from depth 3
    });

    it('should handle maxDepth with circular references', () => {
      const original: any = {
        level1: {
          level2: {
            level3: {},
          },
        },
      };
      original.level1.level2.level3.circular = original;

      // With maxDepth = 3, the circular reference at depth 4 becomes a reference
      const cloned = clone(original, 3);
      expect(cloned).not.toBe(original);
      expect(cloned.level1).not.toBe(original.level1);
      expect(cloned.level1.level2).not.toBe(original.level1.level2);
      expect(cloned.level1.level2.level3).toBe(original.level1.level2.level3); // reference from depth 4
      expect(cloned.level1.level2.level3.circular).toBe(original); // reference preserved
    });

    it('should work without maxDepth parameter (backward compatibility)', () => {
      const original = {
        level1: {
          level2: {
            level3: {
              level4: 'deep',
            },
          },
        },
      };

      const cloned = clone(original);
      expect(cloned).not.toBe(original);
      expect(cloned.level1).not.toBe(original.level1);
      expect(cloned.level1.level2).not.toBe(original.level1.level2);
      expect(cloned.level1.level2.level3).not.toBe(
        original.level1.level2.level3,
      );
      expect(cloned.level1.level2.level3.level4).toBe('deep');
    });

    it('should handle TypedArrays with maxDepth', () => {
      const original = {
        level1: {
          data: new Int32Array([1, 2, 3]),
        },
      };

      // maxDepth = 1: TypedArray becomes reference
      const depth1 = clone(original, 1);
      expect(depth1).not.toBe(original);
      expect(depth1.level1).toBe(original.level1);

      // maxDepth = 2: level1 is cloned, but data (at depth 2) becomes reference
      const depth2 = clone(original, 2);
      expect(depth2).not.toBe(original);
      expect(depth2.level1).not.toBe(original.level1);
      expect(depth2.level1.data).toBe(original.level1.data); // reference at depth 2

      // maxDepth = 3: TypedArray is cloned
      const depth3 = clone(original, 3);
      expect(depth3).not.toBe(original);
      expect(depth3.level1).not.toBe(original.level1);
      expect(depth3.level1.data).not.toBe(original.level1.data);
      expect(depth3.level1.data.buffer).not.toBe(original.level1.data.buffer);
    });

    it('should preserve reference equality when using maxDepth', () => {
      const sharedObj = { shared: true };
      const original = {
        level1: {
          ref1: sharedObj,
          level2: {
            ref2: sharedObj,
          },
        },
      };

      // With maxDepth = 2, ref1 at depth 2 becomes reference, level2 also becomes reference
      const cloned = clone(original, 2);
      expect(cloned.level1.ref1).toBe(sharedObj); // reference at depth 2
      expect(cloned.level1.level2).toBe(original.level1.level2); // reference at depth 2
      expect(cloned.level1.level2.ref2).toBe(sharedObj); // preserved as reference

      // With maxDepth = 3, everything is cloned
      const deepCloned = clone(original, 3);
      expect(deepCloned.level1.ref1).not.toBe(sharedObj); // cloned at depth 2
      expect(deepCloned.level1.level2).not.toBe(original.level1.level2); // cloned at depth 2
      expect(deepCloned.level1.level2.ref2).toBe(sharedObj); // reference at depth 3
    });
  });

  describe('Function cloning', () => {
    it('should return the same function reference for standalone functions', () => {
      const originalFunc = function () {
        return 'test';
      };
      const clonedFunc = clone(originalFunc);

      expect(clonedFunc).toBe(originalFunc);
      expect(clonedFunc()).toBe('test');
    });

    it('should return the same arrow function reference', () => {
      const originalFunc = () => 'arrow function test';
      const clonedFunc = clone(originalFunc);

      expect(clonedFunc).toBe(originalFunc);
      expect(clonedFunc()).toBe('arrow function test');
    });

    it('should clone objects with function properties', () => {
      const original = {
        name: 'test',
        method: function () {
          return 'method result';
        },
        arrowMethod: () => 'arrow method result',
        data: { nested: true },
      };
      const cloned = clone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.data).not.toBe(original.data);
      // 함수는 같은 참조여야 함
      expect(cloned.method).toBe(original.method);
      expect(cloned.arrowMethod).toBe(original.arrowMethod);
      // 함수 실행 결과 확인
      expect(cloned.method()).toBe('method result');
      expect(cloned.arrowMethod()).toBe('arrow method result');
    });

    it('should clone arrays containing functions', () => {
      const func1 = () => 'function 1';
      const func2 = function () {
        return 'function 2';
      };
      const original = [1, func1, { data: 'test' }, func2];
      const cloned = clone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      // 객체는 다른 참조여야 함
      expect(cloned[2]).not.toBe(original[2]);
      // 함수는 같은 참조여야 함
      expect(cloned[1]).toBe(original[1]);
      expect(cloned[3]).toBe(original[3]);
      // 함수 실행 결과 확인
      expect((cloned[1] as () => string)()).toBe('function 1');
      expect((cloned[3] as () => string)()).toBe('function 2');
    });

    it('should handle functions with closures', () => {
      let counter = 0;
      const createCounter = () => {
        return () => ++counter;
      };

      const original = {
        increment: createCounter(),
        data: { value: 42 },
      };
      const cloned = clone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.data).not.toBe(original.data);
      expect(cloned.increment).toBe(original.increment);

      // 클로저 동작 확인
      expect(cloned.increment()).toBe(1);
      expect(original.increment()).toBe(2);
      expect(counter).toBe(2);
    });

    it('should handle class methods', () => {
      class TestClass {
        name: string;
        data: { nested: boolean };

        constructor(name: string) {
          this.name = name;
          this.data = { nested: true };
        }

        getName() {
          return this.name;
        }

        setName(newName: string) {
          this.name = newName;
        }
      }

      const original = new TestClass('original');
      const cloned = clone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.data).not.toBe(original.data);

      // 메소드는 같은 참조여야 함 (프로토타입에서 상속)
      expect(cloned.getName).toBe(original.getName);
      expect(cloned.setName).toBe(original.setName);

      // 메소드 실행 확인
      expect(cloned.getName()).toBe('original');

      // 독립적으로 수정 가능한지 확인
      cloned.setName('cloned');
      expect(cloned.getName()).toBe('cloned');
      expect(original.getName()).toBe('original');
    });

    it('should handle bound functions', () => {
      const obj = {
        value: 'test',
        getValue: function () {
          return this.value;
        },
      };

      const boundFunction = obj.getValue.bind(obj);
      const original = {
        boundFunc: boundFunction,
        data: { test: true },
      };
      const cloned = clone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.data).not.toBe(original.data);
      expect(cloned.boundFunc).toBe(original.boundFunc);

      // 바인딩된 함수 실행 확인
      expect(cloned.boundFunc()).toBe('test');
      expect(original.boundFunc()).toBe('test');
    });

    it('should handle nested objects with mixed data types including functions', () => {
      const helperFunc = (x: number) => x * 2;

      const original = {
        level1: {
          level2: {
            data: [1, 2, 3],
            process: helperFunc,
            nested: {
              date: new Date('2024-01-01'),
              map: new Map([['key', 'value']]),
              callback: () => 'nested callback',
            },
          },
        },
        utils: {
          helper: helperFunc,
          formatter: (str: string) => str.toUpperCase(),
        },
      };

      const cloned = clone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);

      // 중첩된 객체들은 다른 참조여야 함
      expect(cloned.level1).not.toBe(original.level1);
      expect(cloned.level1.level2).not.toBe(original.level1.level2);
      expect(cloned.level1.level2.data).not.toBe(original.level1.level2.data);
      expect(cloned.level1.level2.nested).not.toBe(
        original.level1.level2.nested,
      );
      expect(cloned.level1.level2.nested.date).not.toBe(
        original.level1.level2.nested.date,
      );
      expect(cloned.level1.level2.nested.map).not.toBe(
        original.level1.level2.nested.map,
      );
      expect(cloned.utils).not.toBe(original.utils);

      // 함수들은 같은 참조여야 함
      expect(cloned.level1.level2.process).toBe(original.level1.level2.process);
      expect(cloned.level1.level2.nested.callback).toBe(
        original.level1.level2.nested.callback,
      );
      expect(cloned.utils.helper).toBe(original.utils.helper);
      expect(cloned.utils.formatter).toBe(original.utils.formatter);

      // 함수 실행 확인
      expect(cloned.level1.level2.process(5)).toBe(10);
      expect(cloned.level1.level2.nested.callback()).toBe('nested callback');
      expect(cloned.utils.helper(3)).toBe(6);
      expect(cloned.utils.formatter('hello')).toBe('HELLO');
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
