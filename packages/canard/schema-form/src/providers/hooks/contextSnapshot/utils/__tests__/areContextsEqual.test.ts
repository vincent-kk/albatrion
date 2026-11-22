import { expect, it } from 'vitest';

import { areContextsEqual } from '../areContextsEqual';

it('keeps content comparison for plain objects, arrays and supported built-ins', () => {
  const make = () => ({
    list: [1, NaN, { date: new Date(100), re: /a/g }],
    map: new Map([['a', { b: 2 }]]),
    set: new Set([1, 2]),
    bytes: new Uint8Array([1, 2]),
  });
  expect(areContextsEqual(make(), make())).toBe(true);
  expect(areContextsEqual(make(), { ...make(), list: [2] })).toBe(false);
});

it('compares a plain context proxy with one prototype read', () => {
  let prototypeReads = 0;
  const context = new Proxy({ label: 'field' }, {
    getPrototypeOf(target) {
      if (++prototypeReads > 1) throw new Error('Repeated prototype read');
      return Object.getPrototypeOf(target);
    },
  });

  expect(areContextsEqual(context, { label: 'field' })).toBe(true);
  expect(prototypeReads).toBe(1);
});

it('compares an array context proxy without reading its prototype', () => {
  const context = new Proxy([1], {
    getPrototypeOf() {
      throw new Error('Array prototype read');
    },
  });

  expect(areContextsEqual(context, [1])).toBe(true);
});

it('treats URLs and opaque instances in objects, arrays and map values by reference', () => {
  class Opaque {
    private __value__ = 1;
    get value() {
      return this.__value__;
    }
  }
  for (const make of [
    () => new URL('https://example.com'),
    () => new URLSearchParams('a=1'),
    () => new Opaque(),
  ]) {
    const first = make();
    const second = make();
    expect(areContextsEqual({ nested: [first] }, { nested: [first] })).toBe(
      true,
    );
    expect(areContextsEqual({ nested: [first] }, { nested: [second] })).toBe(
      false,
    );
    expect(
      areContextsEqual(new Map([['a', first]]), new Map([['a', second]])),
    ).toBe(false);
  }
});
it('requires replacement to detect opaque in-place mutations', () => {
  const query = new URLSearchParams('a=1');
  const previous = { query };
  query.set('a', '2');
  expect(areContextsEqual(previous, { query })).toBe(true);
  expect(
    areContextsEqual(previous, { query: new URLSearchParams('a=2') }),
  ).toBe(false);
});

/** An error with an own non-enumerable cause, as the ES2022 constructor option creates it. */
const errorWithCause = (cause?: unknown): Error =>
  cause === undefined
    ? new Error('same')
    : Object.defineProperty(new Error('same'), 'cause', {
        value: cause,
        writable: true,
        configurable: true,
      });
/** An AggregateError, read from the global because the package's type library predates it. */
const aggregate = (errors: readonly Error[]): Error =>
  Reflect.construct(Reflect.get(globalThis, 'AggregateError'), [
    errors,
    'same',
  ]);

it('compares the own error slots cause and errors like enumerable properties', () => {
  const withSlot = (slot: string, value: unknown, enumerable: boolean) => ({
    error: Object.defineProperty(new Error('same'), slot, {
      value,
      enumerable,
      writable: true,
      configurable: true,
    }),
  });
  for (const slot of ['cause', 'errors'])
    for (const [left, right] of [
      [{ code: 1 }, { code: 2 }],
      [{ code: 1 }, { code: 1 }],
      [[new Error('a')], [new Error('b')]],
      [[new Error('a')], [new Error('a')]],
    ])
      expect(
        areContextsEqual(
          withSlot(slot, left, false),
          withSlot(slot, right, false),
        ),
        slot + ' ' + JSON.stringify([left, right]),
      ).toBe(
        areContextsEqual(
          withSlot(slot, left, true),
          withSlot(slot, right, true),
        ),
      );
});
it('distinguishes errors that differ only in cause or aggregated errors', () => {
  const differs = (left: Error, right: Error) =>
    !areContextsEqual({ error: left }, { error: right });
  expect(
    differs(errorWithCause({ code: 1 }), errorWithCause({ code: 2 })),
  ).toBe(true);
  expect(
    differs(errorWithCause({ code: 1 }), errorWithCause({ code: 1 })),
  ).toBe(false);
  expect(differs(errorWithCause('reason'), errorWithCause())).toBe(true);
  expect(
    differs(aggregate([new Error('a')]), aggregate([new Error('b')])),
  ).toBe(true);
  expect(
    differs(aggregate([new Error('a')]), aggregate([new Error('a')])),
  ).toBe(false);
});
it('ends on errors whose cause refers back to the error', () => {
  const make = () => {
    const error = errorWithCause('pending');
    Reflect.set(error, 'cause', { error });
    return { error };
  };
  expect(areContextsEqual(make(), make())).toBe(true);
});
