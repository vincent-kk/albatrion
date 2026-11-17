import { describe, expect, it } from 'vitest';

import { clone } from '../clone';

/**
 * 내장 타입 복제의 충실도 — 메모리 격리와 참조 동일성 보존.
 * 일반 동작은 clone.test.ts 담당(이미 test-record 상한에 근접해 분할).
 */
describe('clone built-in types', () => {
  it('should not share memory with the original Buffer', () => {
    const source = Buffer.from([1, 2, 3]);

    const cloned = clone(source);
    cloned[0] = 99;

    expect(source[0]).toBe(1);
    expect(Buffer.isBuffer(cloned)).toBe(true);
  });

  it('should keep a shared Date reference shared in the clone', () => {
    const shared = new Date('2024-01-01T00:00:00.000Z');

    const cloned = clone({ a: shared, b: shared });

    expect(cloned.a).not.toBe(shared);
    expect(cloned.a).toBe(cloned.b);
    expect(cloned.a.getTime()).toBe(shared.getTime());
  });

  it('should keep shared RegExp and TypedArray references shared in the clone', () => {
    const regex = /x/g;
    const bytes = new Uint8Array([1, 2]);

    const cloned = clone({ a: regex, b: regex, c: bytes, d: bytes });

    expect(cloned.a).not.toBe(regex);
    expect(cloned.a).toBe(cloned.b);
    expect(cloned.c).not.toBe(bytes);
    expect(cloned.c).toBe(cloned.d);
  });

  it('should preserve the groups of a RegExp match array', () => {
    const match = /(?<word>\w+)/.exec('hello');
    if (match === null) throw new Error('match is required for this case');

    const cloned = clone(match);

    expect(cloned.groups).toEqual({ word: 'hello' });
    expect(cloned.index).toBe(match.index);
    expect(cloned.input).toBe(match.input);
  });

  it('should keep the primitive value of boxed Number, String and Boolean', () => {
    const number = clone(new Number(5));
    const string = clone(new String('ab'));
    const boolean = clone(new Boolean(false));

    expect(number.valueOf()).toBe(5);
    expect(string.valueOf()).toBe('ab');
    expect(boolean.valueOf()).toBe(false);
    expect(number).toBeInstanceOf(Number);
  });

  it('should keep the message and the cloned errors of an AggregateError', () => {
    const inner = new Error('inner');
    const original = new AggregateError([inner], 'boom');

    const cloned = clone(original);

    expect(cloned).toBeInstanceOf(AggregateError);
    expect(cloned.message).toBe('boom');
    expect(cloned.errors).toHaveLength(1);
    expect(cloned.errors[0]).not.toBe(inner);
    expect(cloned.errors[0].message).toBe('inner');
    expect(Object.keys(cloned)).toEqual([]);
  });

  it('should define an own field that shadows an inherited setter instead of calling it', () => {
    class Base {
      _x = 0;
      set x(value: number) {
        this._x = value * 2;
      }
      get x() {
        return this._x;
      }
    }
    const original = new Base();
    Object.defineProperty(original, 'x', {
      value: 5,
      writable: true,
      enumerable: true,
      configurable: true,
    });

    const cloned = clone(original);

    expect(cloned.x).toBe(5);
    expect(cloned._x).toBe(0);
  });
});
