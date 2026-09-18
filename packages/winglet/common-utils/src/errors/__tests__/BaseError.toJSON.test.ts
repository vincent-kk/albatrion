import { describe, expect, it } from 'vitest';

import { AbortError } from '../AbortError';
import { BaseError } from '../BaseError';
import { InvalidTypeError } from '../InvalidTypeError';
import { TimeoutError } from '../TimeoutError';

// filid:contract base-error-json
describe('BaseError.toJSON', () => {
  it('projects only the diagnostic contract and integrates with JSON.stringify', () => {
    const error = new AbortError('CANCELLED', 'Cancelled', { id: 1 });
    Object.assign(error, { privateField: 'excluded' });
    const expected = {
      name: 'Abort',
      message: 'Cancelled',
      stack: error.stack,
      group: 'ABORT',
      specific: 'CANCELLED',
      code: 'ABORT.CANCELLED',
      details: { id: 1 },
    };
    expect(error.toJSON()).toStrictEqual(expected);
    expect(JSON.parse(JSON.stringify(error))).toStrictEqual(expected);
  });

  it('inherits serialization in every concrete error class', () => {
    for (const ErrorClass of [AbortError, InvalidTypeError, TimeoutError]) {
      const error = new ErrorClass('CODE', 'message');
      expect(error.toJSON()).toMatchObject({
        name: error.name,
        code: error.code,
        details: {},
      });
      expect(error.toJSON).toBe(BaseError.prototype.toJSON);
    }
  });

  it('omits an absent stack from JSON text', () => {
    const error = new AbortError('CODE', 'message');
    delete error.stack;
    expect(error.toJSON().stack).toBeUndefined();
    expect(JSON.parse(JSON.stringify(error))).not.toHaveProperty('stack');
  });

  it('detaches nested data without modifying the source', () => {
    const nested = Object.freeze({ value: 1 });
    const details = Object.freeze({ nested, list: Object.freeze([nested]) });
    const error = new AbortError('CODE', 'message', details);
    const result = error.toJSON().details as typeof details;
    expect(result).toEqual(details);
    expect(result).not.toBe(details);
    expect(result.nested).not.toBe(nested);
    expect(result.list).not.toBe(details.list);
    expect(result.list[0]).not.toBe(nested);
  });

  it('removes ancestor cycles including references back to the error', () => {
    const details: Record<string, unknown> = {};
    const error = new AbortError('CODE', 'message', details);
    details.self = details;
    details.error = error;
    details.child = { parent: details, value: 1 };
    expect(error.toJSON().details).toEqual({ child: { value: 1 } });
    expect(() => JSON.stringify(error)).not.toThrow();
    expect(details.self).toBe(details);
  });

  it('preserves repeated references outside the current ancestor path', () => {
    const shared = { id: 1 };
    const error = new AbortError('CODE', 'message', {
      a: shared,
      b: shared,
      list: [shared, shared],
    });
    expect(error.toJSON().details).toEqual({
      a: { id: 1 },
      b: { id: 1 },
      list: [{ id: 1 }, { id: 1 }],
    });
  });

  it('keeps array positions for cycles, holes and unsupported values', () => {
    const list: unknown[] = [undefined, () => 1, Symbol('s'), undefined, 1];
    delete list[3];
    list.push(list);
    expect(
      new AbortError('CODE', 'message', { list }).toJSON().details,
    ).toEqual({ list: [null, null, null, null, 1, null] });
  });

  it('normalizes special primitives and omits unsupported object values', () => {
    const error = new AbortError('CODE', 'message', {
      bigint: BigInt('9007199254740993'),
      nan: NaN,
      infinity: Infinity,
      missing: undefined,
      fn: () => 1,
      symbol: Symbol('s'),
      nil: null,
      bool: false,
      number: 0,
      string: '',
    });
    const expected = {
      bigint: '9007199254740993',
      nan: null,
      infinity: null,
      nil: null,
      bool: false,
      number: 0,
      string: '',
    };
    expect(error.toJSON().details).toEqual(expected);
    expect(JSON.parse(JSON.stringify(error)).details).toEqual(expected);
  });

  it('includes nested native error diagnostics, enumerable metadata and causes', () => {
    const cause = new Error('root');
    const nested = new TypeError('invalid');
    Object.defineProperty(nested, 'cause', { value: cause });
    Object.assign(nested, { code: 'BAD_INPUT' });
    const error = new AbortError('CODE', 'message', { nested });
    expect(error.toJSON().details).toEqual({
      nested: {
        name: 'TypeError',
        message: 'invalid',
        stack: nested.stack,
        code: 'BAD_INPUT',
        cause: { name: 'Error', message: 'root', stack: cause.stack },
      },
    });
  });

  it('serializes nested BaseErrors without restarting circular traversal', () => {
    const nested = new TimeoutError('WAIT', 'Timed out');
    const error = new AbortError('CODE', 'message', { nested });
    nested.details.parent = error;
    Object.defineProperty(nested, 'cause', { value: nested });
    expect(error.toJSON().details).toEqual({
      nested: {
        name: nested.name,
        message: nested.message,
        stack: nested.stack,
        group: nested.group,
        specific: nested.specific,
        code: nested.code,
        details: {},
      },
    });
  });

  it('honors Date and custom toJSON hooks with their property keys', () => {
    const keys: string[] = [];
    const hook = {
      toJSON(key: string) {
        keys.push(key);
        return { value: BigInt(2) };
      },
    };
    const error = new AbortError('CODE', 'message', {
      date: new Date('2026-01-01T00:00:00Z'),
      invalidDate: new Date(NaN),
      hook,
      list: [hook],
    });
    expect(error.toJSON().details).toEqual({
      date: '2026-01-01T00:00:00.000Z',
      invalidDate: null,
      hook: { value: '2' },
      list: [{ value: '2' }],
    });
    expect(keys).toEqual(['hook', '0']);
  });

  it('handles hook results referring to themselves or ancestors', () => {
    const self = {
      value: 1,
      toJSON() {
        return this;
      },
    };
    const indirect = {
      toJSON() {
        return { back: indirect, value: 2 };
      },
    };
    const details: Record<string, unknown> = { self, indirect };
    details.parent = {
      toJSON() {
        return details;
      },
    };
    expect(new AbortError('CODE', 'message', details).toJSON().details).toEqual(
      { self: { value: 1 }, indirect: { value: 2 } },
    );
  });

  it('allows the details hook to return a primitive or an omitted value', () => {
    const error = new AbortError('CODE', 'message', {
      toJSON(key: string) {
        return key;
      },
    });
    expect(error.toJSON().details).toBe('details');
    const omitted = new AbortError('CODE', 'message', {
      toJSON() {
        return undefined;
      },
    });
    expect(omitted.toJSON().details).toBeUndefined();
    expect(JSON.parse(JSON.stringify(omitted))).not.toHaveProperty('details');
  });

  it('copies only own enumerable string keys and keeps __proto__ as data', () => {
    const details = Object.create({ inherited: true });
    Object.defineProperty(details, 'hidden', { value: true });
    Object.defineProperty(details, '__proto__', {
      value: { polluted: true },
      enumerable: true,
    });
    details[Symbol('private')] = true;
    const result = new AbortError('CODE', 'message', details).toJSON().details;
    expect(result).toStrictEqual(JSON.parse('{"__proto__":{"polluted":true}}'));
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
  });

  it('propagates exceptions from getters and custom serialization hooks', () => {
    const failure = new Error('user code failed');
    const getter = {
      get value() {
        throw failure;
      },
    };
    const hook = {
      toJSON() {
        throw failure;
      },
    };
    for (const value of [getter, hook]) {
      expect(() =>
        new AbortError('CODE', 'message', { value }).toJSON(),
      ).toThrow(failure);
    }
  });
});
