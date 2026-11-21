import { afterEach, describe, expect, test, vi } from 'vitest';

import {
  AbortError,
  TimeoutError,
  clone,
  debounce,
  equals,
  merge,
  stableEquals,
  withTimeout,
} from '../../index';

describe('equals built-in state', () => {
  test('equals: ArrayBuffers with different bytes are not equal', () => {
    const a = new Uint8Array([1]).buffer;
    const b = new Uint8Array([2]).buffer;
    expect(equals(a, b)).toBe(false);
  });
  test('equals: DataViews over different bytes are not equal', () => {
    expect(
      equals(
        new DataView(new Uint8Array([1]).buffer),
        new DataView(new Uint8Array([2]).buffer),
      ),
    ).toBe(false);
  });
  test('equals: boxed numbers with different values are not equal', () => {
    expect(equals(new Number(1), new Number(2))).toBe(false);
  });
  test('equals: errors with different messages are not equal', () => {
    expect(equals(new Error('a'), new Error('b'))).toBe(false);
  });
  test('stableEquals: boxed numbers / booleans with different values are not equal', () => {
    expect(stableEquals(new Number(1), new Number(2))).toBe(false);
    expect(stableEquals(new Boolean(true), new Boolean(false))).toBe(false);
  });
});

describe('stableEquals key presence', () => {
  test('a key only inherited on the right does not satisfy an own key on the left', () => {
    const left = { constructor: Object, x: 1 };
    const right = { x: 1, y: 2 };
    expect(stableEquals(left, right)).toBe(false);
  });
});

describe('clone', () => {
  test('boxed Number clone keeps its primitive value', () => {
    const cloned = clone(new Number(5));
    expect(() => cloned.valueOf()).not.toThrow();
    expect(cloned.valueOf()).toBe(5);
  });
  test('AggregateError clone keeps message and errors', () => {
    const inner = new Error('inner');
    const original = new AggregateError([inner], 'boom');
    const cloned = clone(original);
    expect(cloned.message).toBe('boom');
    expect(cloned.errors.length).toBe(1);
  });
  test('class instance whose own field shadows an inherited setter keeps the field', () => {
    class Base {
      _x = 0;
      set x(value: number) {
        this._x = value * 2;
      }
      get x() {
        return this._x;
      }
    }
    class Derived extends Base {
      // define semantics create an own data property shadowing the accessor
      constructor() {
        super();
        Object.defineProperty(this, 'x', {
          value: 5,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
    }
    const original = new Derived();
    expect(original.x).toBe(5);
    const cloned = clone(original);
    expect(cloned.x).toBe(5);
  });
});

describe('debounce', () => {
  afterEach(() => {
    vi.useRealTimers();
  });
  test('a call made from inside the debounced function is not lost', () => {
    vi.useFakeTimers();
    const calls: number[] = [];
    const debounced = debounce((n: number) => {
      calls.push(n);
      if (n === 1) debounced(2);
    }, 100);
    debounced(1);
    vi.advanceTimersByTime(100);
    vi.advanceTimersByTime(500);
    expect(calls).toEqual([1, 2]);
  });
  test('leading call that throws is not re-run by the trailing edge', () => {
    vi.useFakeTimers();
    const fn = vi.fn(() => {
      throw new Error('fail');
    });
    const debounced = debounce(fn, 100, { leading: true, trailing: true });
    expect(() => debounced()).toThrow('fail');
    try {
      vi.advanceTimersByTime(200);
    } catch {
      // trailing rethrow is also observable
    }
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('withTimeout', () => {
  test('an already-aborted signal rejects with AbortError instead of waiting for TimeoutError', async () => {
    const controller = new AbortController();
    controller.abort();
    const started = Date.now();
    const result = withTimeout(() => new Promise<never>(() => {}), 300, {
      signal: controller.signal,
    }).catch((error) => error);
    const error = await result;
    expect(error).toBeInstanceOf(AbortError);
    expect(error).not.toBeInstanceOf(TimeoutError);
    expect(Date.now() - started).toBeLessThan(250);
  });
});

describe('merge sanity', () => {
  test('immutable merge does not mutate either input', () => {
    const target = Object.freeze({ a: Object.freeze({ x: 1 }), list: Object.freeze([1, 2]) });
    const source = Object.freeze({ a: Object.freeze({ y: 2 }), list: Object.freeze([3]) });
    const result = merge(target as any, source as any, { immutable: true });
    expect(result).toEqual({ a: { x: 1, y: 2 }, list: [3, 2] });
  });
  test('options mode does not pollute via constructor.prototype', () => {
    const payload = JSON.parse('{"constructor":{"prototype":{"polluted":1}},"__proto__":{"polluted2":1}}');
    merge({}, payload, {});
    merge({}, payload);
    expect(({} as any).polluted).toBeUndefined();
    expect(({} as any).polluted2).toBeUndefined();
  });
});
