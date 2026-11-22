import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

import { clone } from '../index';

/** The ES2020 type library this package compiles against does not declare AggregateError. */
const AggregateErrorConstructor: new (
  errors: Iterable<unknown>,
  message?: string,
) => Error & { errors: Error[] } = Reflect.get(globalThis, 'AggregateError');

describe('clone built-in types', () => {
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

  it.each([
    ['Number', 'new Number(5)', 5],
    ['String', "new String('ab')", 'ab'],
    ['Boolean', 'new Boolean(false)', false],
  ])(
    'should keep the primitive value of a boxed %s from another realm',
    (_, source, primitive) => {
      const foreign: object = runInNewContext(source);

      const cloned = clone(foreign);

      expect(cloned.valueOf()).toBe(primitive);
      expect(Object.getPrototypeOf(cloned)).toBe(
        Object.getPrototypeOf(foreign),
      );
    },
  );

  it('should clone an object that only forges a box tag as an ordinary instance', () => {
    class Forged {
      value = 1;
      get [Symbol.toStringTag]() {
        return 'Number';
      }
    }

    const cloned = clone(new Forged());

    expect(cloned).toBeInstanceOf(Forged);
    expect(cloned.value).toBe(1);
  });

  it('should clone an object built on a box prototype without a primitive value', () => {
    const original = Object.assign(Object.create(Number.prototype), { a: 1 });

    const cloned = clone(original);

    expect(Object.getPrototypeOf(cloned)).toBe(Number.prototype);
    expect(cloned.a).toBe(1);
  });
});
