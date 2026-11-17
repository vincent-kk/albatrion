import { describe, expect, it } from 'vitest';

import { clone } from '../clone';

/** The ES2020 type library this package compiles against does not declare AggregateError. */
const AggregateErrorConstructor: new (
  errors: Iterable<unknown>,
  message?: string,
) => Error & { errors: Error[] } = Reflect.get(globalThis, 'AggregateError');

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

  it('should keep the prototype and own fields of a boxed primitive subclass', () => {
    class Money extends Number {
      currency = 'KRW';
    }

    const cloned = clone(new Money(10));

    expect(cloned).toBeInstanceOf(Money);
    expect(cloned.valueOf()).toBe(10);
    expect(cloned.currency).toBe('KRW');
  });

  it('should keep the message and the cloned errors of an AggregateError', () => {
    const inner = new Error('inner');
    const original = new AggregateErrorConstructor([inner], 'boom');

    const cloned = clone(original);

    expect(cloned).toBeInstanceOf(AggregateErrorConstructor);
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

  it('should define own fields that shadow an inherited getter or read-only property', () => {
    class Shape {
      declare readonly kind: string;
      get area() {
        return 0;
      }
    }
    Object.defineProperty(Shape.prototype, 'kind', {
      value: 'shape',
      writable: false,
    });
    const original = new Shape();
    Object.defineProperty(original, 'area', { value: 4, enumerable: true });
    Object.defineProperty(original, 'kind', {
      value: 'square',
      enumerable: true,
    });

    const cloned = clone(original);

    expect(cloned).toBeInstanceOf(Shape);
    expect(cloned.area).toBe(4);
    expect(cloned.kind).toBe('square');
  });

  it('should clone an object built on a box prototype without a primitive value', () => {
    const original = Object.assign(Object.create(Number.prototype), { a: 1 });

    const cloned = clone(original);

    expect(Object.getPrototypeOf(cloned)).toBe(Number.prototype);
    expect(cloned.a).toBe(1);
  });
});
