import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

import { clone } from '../index';
import { equals } from '../index';
import { stableEquals } from '../index';

const ownShape = (value: object) =>
  Reflect.ownKeys(value).map((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
    return `${String(key)}:${descriptor.enumerable ? 'e' : 'n'}`;
  });

describe('clone keeps an Error cause as it was', () => {
  it('a local Error with a cause clones with the same enumerable keys', () => {
    const error = Object.defineProperty(new Error('failed'), 'cause', {
      value: 'disk full',
      configurable: true,
      writable: true,
    });
    const copy = clone(error);
    expect(Reflect.get(copy, 'cause')).toBe('disk full');
    expect(Object.keys(copy)).toEqual(Object.keys(error));
  });

  it('equals(error, clone(error)) is true for a local Error with a cause', () => {
    const error = Object.defineProperty(new Error('failed'), 'cause', {
      value: { code: 7 },
      configurable: true,
      writable: true,
    });
    expect(equals(error, clone(error))).toBe(true);
  });

  it('control: stableEquals(error, clone(error)) is true', () => {
    const error = Object.defineProperty(new Error('failed'), 'cause', {
      value: { code: 7 },
      configurable: true,
      writable: true,
    });
    expect(stableEquals(error, clone(error))).toBe(true);
  });

  it('control: a foreign Error with a cause keeps cause non-enumerable', () => {
    const foreign = runInNewContext(
      'new Error("failed", { cause: "disk full" })',
    );
    const copy = clone(foreign);
    expect(Reflect.get(copy, 'cause')).toBe('disk full');
    expect(Object.keys(copy)).toEqual([]);
  });

  it('a local and a foreign Error with the same cause clone to the same property shape', () => {
    const local = clone(
      Object.defineProperty(new Error('failed'), 'cause', {
        value: 'disk full',
        configurable: true,
        writable: true,
      }),
    );
    const foreign = clone(
      runInNewContext('new Error("failed", { cause: "disk full" })'),
    );
    expect(ownShape(local).filter((key) => key.startsWith('cause'))).toEqual(
      ownShape(foreign).filter((key) => key.startsWith('cause')),
    );
  });

  it('JSON of a cloned local Error equals JSON of the original', () => {
    const error = Object.defineProperty(new Error('failed'), 'cause', {
      value: 'disk full',
      configurable: true,
      writable: true,
    });
    expect(JSON.stringify(clone(error))).toBe(JSON.stringify(error));
  });
});

describe('clone keeps the prototype chain of built-in subclasses', () => {
  it('a Map subclass instance clones into the same subclass', () => {
    class Registry extends Map<string, number> {
      total() {
        let sum = 0;
        for (const value of this.values()) sum += value;
        return sum;
      }
    }
    const registry = new Registry([['a', 1]]);
    const copy = clone(registry);
    expect(Object.getPrototypeOf(copy)).toBe(Registry.prototype);
  });

  it('a Date subclass instance clones into the same subclass', () => {
    class Day extends Date {
      label() {
        return this.toISOString().slice(0, 10);
      }
    }
    const day = new Day(0);
    const copy = clone(day);
    expect(Object.getPrototypeOf(copy)).toBe(Day.prototype);
  });

  it.each([
    [
      'Array',
      () => {
        class Stack extends Array<number> {}
        return Stack.from([1, 2]);
      },
    ],
    [
      'Set',
      () => {
        class Tags extends Set<string> {}
        return new Tags(['a']);
      },
    ],
    [
      'RegExp',
      () => {
        class Rule extends RegExp {}
        return new Rule('a+', 'g');
      },
    ],
  ])('a %s subclass instance clones into the same subclass', (_name, make) => {
    const value = make();
    const copy = clone(value);
    expect(Object.getPrototypeOf(copy) === Object.getPrototypeOf(value)).toBe(
      true,
    );
  });

  it('a subclass method still works on the clone (DefaultMap)', () => {
    class DefaultMap extends Map<string, number> {
      get(key: string) {
        return super.has(key) ? super.get(key) : 0;
      }
    }
    const counts = new DefaultMap([['seen', 2]]);
    expect(clone(counts).get('missing')).toBe(0);
  });

  it('control: a plain class instance keeps its prototype', () => {
    class Point {
      constructor(
        public x: number,
        public y: number,
      ) {}
    }
    expect(Object.getPrototypeOf(clone(new Point(1, 2)))).toBe(Point.prototype);
  });

  it('control: an Error subclass keeps its prototype', () => {
    class HttpError extends Error {}
    expect(Object.getPrototypeOf(clone(new HttpError('x')))).toBe(
      HttpError.prototype,
    );
  });
});
