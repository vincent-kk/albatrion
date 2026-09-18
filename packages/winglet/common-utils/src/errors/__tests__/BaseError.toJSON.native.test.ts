import { runInNewContext, runInThisContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

import { AbortError } from '../AbortError';

// The package targets ES2020; Node supplies AggregateError for these runtime tests.
const NativeAggregateError = runInThisContext('AggregateError') as new (
  errors: unknown[],
  message: string,
) => Error & { errors: unknown[] };

// filid:contract base-error-json-native-errors
describe('BaseError.toJSON native errors', () => {
  it.each(['Error', 'TypeError'])(
    'preserves a foreign %s and its cause',
    (kind) => {
      const value = runInNewContext(
        `new ${kind}("foreign", { cause: new Error("root") })`,
      ) as Error & { cause: Error };
      expect(value).not.toBeInstanceOf(Error);
      expect(
        new AbortError('CODE', 'message', { value }).toJSON().details,
      ).toEqual({
        value: {
          name: kind,
          message: 'foreign',
          stack: value.stack,
          cause: { name: 'Error', message: 'root', stack: value.cause.stack },
        },
      });
    },
  );

  it('preserves native aggregate error entries', () => {
    const child = new Error('child');
    const value = new NativeAggregateError([child], 'aggregate');
    expect(
      new AbortError('CODE', 'message', { value }).toJSON().details,
    ).toEqual({
      value: {
        name: 'AggregateError',
        message: 'aggregate',
        stack: value.stack,
        errors: [{ name: 'Error', message: 'child', stack: child.stack }],
      },
    });
  });

  it('preserves foreign aggregate entries even after renaming', () => {
    const value = runInNewContext(
      'new AggregateError([1, "reason", null], "foreign")',
    ) as Error;
    value.name = 'CustomAggregate';
    expect(
      new AbortError('CODE', 'message', { value }).toJSON().details,
    ).toEqual({
      value: {
        name: 'CustomAggregate',
        message: 'foreign',
        stack: value.stack,
        errors: [1, 'reason', null],
      },
    });
  });

  it('keeps aggregate array positions and removes cycles without mutating the source', () => {
    const value = new NativeAggregateError([], 'cycle');
    const error = new AbortError('CODE', 'message', { value });
    value.errors.push(value, error, BigInt(2), undefined);
    Object.freeze(value.errors);
    Object.freeze(value);
    expect(JSON.parse(JSON.stringify(error)).details.value.errors).toEqual([
      null,
      null,
      '2',
      null,
    ]);
    expect(value.errors[0]).toBe(value);
    expect(value.errors[1]).toBe(error);
  });

  it('preserves shared errors in nested aggregates and causes', () => {
    const child = new Error('shared');
    const inner = new NativeAggregateError([child], 'inner');
    const outer = new NativeAggregateError([inner, child], 'outer');
    Object.defineProperty(outer, 'cause', { value: child });
    const result = JSON.parse(
      JSON.stringify(new AbortError('CODE', 'message', { outer })),
    ).details.outer;
    expect(result.errors[0].errors[0]).toEqual(result.errors[1]);
    expect(result.cause).toEqual(result.errors[1]);
    expect(result.errors[1].message).toBe('shared');
  });

  it('supports older engines without Error.isError and rejects spoofed Error tags', () => {
    const descriptor = Object.getOwnPropertyDescriptor(Error, 'isError');
    Object.defineProperty(Error, 'isError', {
      value: undefined,
      configurable: true,
    });
    try {
      const foreign = runInNewContext('new Error("foreign")') as Error;
      const fake = { [Symbol.toStringTag]: 'Error', id: 1 };
      const local = new Error('local');
      Object.defineProperty(local, Symbol.toStringTag, { value: 'Custom' });
      Object.defineProperty(fake, 'message', { value: 'hidden' });
      expect(
        new AbortError('CODE', 'message', { foreign, fake, local }).toJSON()
          .details,
      ).toEqual({
        foreign: { name: 'Error', message: 'foreign', stack: foreign.stack },
        fake: { id: 1 },
        local: { name: 'Error', message: 'local', stack: local.stack },
      });
    } finally {
      if (descriptor) Object.defineProperty(Error, 'isError', descriptor);
      else Reflect.deleteProperty(Error, 'isError');
    }
  });

  it('does not promote ordinary tagged objects to native errors', () => {
    const value = { [Symbol.toStringTag]: 'Error', id: 1 };
    Object.defineProperty(value, 'message', { value: 'hidden' });
    expect(
      new AbortError('CODE', 'message', { value }).toJSON().details,
    ).toEqual({ value: { id: 1 } });
  });

  it('projects error diagnostics without invoking their custom toJSON', () => {
    const value = new Error('diagnostic');
    Object.assign(value, {
      toJSON() {
        throw new Error('must not run');
      },
    });
    expect(
      new AbortError('CODE', 'message', { value }).toJSON().details,
    ).toEqual({
      value: { name: 'Error', message: 'diagnostic', stack: value.stack },
    });
  });

  it('propagates exceptions from aggregate errors accessors', () => {
    const failure = new Error('access failed');
    const value = new NativeAggregateError([], 'aggregate');
    Object.defineProperty(value, 'errors', {
      get() {
        throw failure;
      },
    });
    expect(() => new AbortError('CODE', 'message', { value }).toJSON()).toThrow(
      failure,
    );
  });

  it.skipIf(typeof Reflect.get(Error, 'isError') !== 'function')(
    'recognizes foreign errors with custom tags (requires native Error.isError)',
    () => {
      const value = runInNewContext('new Error("foreign")') as Error;
      Object.defineProperty(value, Symbol.toStringTag, { value: 'Custom' });
      expect(
        new AbortError('CODE', 'message', { value }).toJSON().details,
      ).toEqual({
        value: { name: 'Error', message: 'foreign', stack: value.stack },
      });
    },
  );
});
