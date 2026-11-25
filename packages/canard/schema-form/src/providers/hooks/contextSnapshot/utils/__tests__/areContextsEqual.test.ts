import { runInNewContext } from 'node:vm';
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

/** Real built-ins keyed by the tag name an impostor can claim through `Symbol.toStringTag`. */
const BUILTINS: ReadonlyArray<readonly [string, () => object]> = [
  ['Map', () => new Map()],
  ['Set', () => new Set()],
  ['Date', () => new Date(0)],
  ['RegExp', () => /a/],
  ['ArrayBuffer', () => new ArrayBuffer(0)],
  ['Number', () => Object(0)],
  ['String', () => Object('')],
  ['Boolean', () => Object(false)],
  ['Error', () => new Error()],
  ['Uint8Array', () => new Uint8Array(0)],
  ['DataView', () => new DataView(new ArrayBuffer(0))],
];
/** Whether the runtime can tell a real error from an object that only claims the Error tag. */
const canBrandErrors = typeof Reflect.get(Error, 'isError') === 'function';
/** An instance of a class whose only claim to a built-in is its `Symbol.toStringTag`. */
const claimTag = (tag: string): object =>
  new (class {
    get [Symbol.toStringTag]() {
      return tag;
    }
  })();
/** The comparison result, or the name of what it threw, so one assertion reports every tag. */
const compare = (left: unknown, right: unknown): boolean | string => {
  try {
    return areContextsEqual(left, right);
  } catch (error) {
    return error instanceof Error ? error.name : 'non-error throw';
  }
};
/** The expected comparison result for every tag in `BUILTINS`. */
const expectedByTag = (result: (tag: string) => boolean) =>
  Object.fromEntries(BUILTINS.map(([tag]) => [tag, result(tag)]));

it('compares objects that only claim a built-in tag by reference', () => {
  for (const claim of [
    claimTag,
    (tag: string): object =>
      Object.assign(Object.create(null), { [Symbol.toStringTag]: tag }),
  ]) {
    const different: Record<string, boolean | string> = {};
    const same: Record<string, boolean | string> = {};
    for (const [tag] of BUILTINS) {
      const shared = claim(tag);
      different[tag] = compare({ value: claim(tag) }, { value: claim(tag) });
      same[tag] = compare({ value: shared }, { value: shared });
    }
    expect(different).toEqual(
      expectedByTag((tag) => tag === 'Error' && !canBrandErrors),
    );
    expect(same).toEqual(expectedByTag(() => true));
  }
});
it('treats a real built-in and an object claiming its tag as different in both orders', () => {
  const realFirst: Record<string, boolean | string> = {};
  const claimFirst: Record<string, boolean | string> = {};
  for (const [tag, make] of BUILTINS) {
    realFirst[tag] = compare({ value: make() }, { value: claimTag(tag) });
    claimFirst[tag] = compare({ value: claimTag(tag) }, { value: make() });
  }
  expect(realFirst).toEqual(expectedByTag(() => false));
  expect(claimFirst).toEqual(expectedByTag(() => false));
});
it('does not take an own size of 0 for the state of an empty Map or Set', () => {
  for (const [tag, make] of [
    ['Map', () => new Map()],
    ['Set', () => new Set()],
  ] as const) {
    const impostor = Object.assign(claimTag(tag), { size: 0 });
    expect(compare({ value: make() }, { value: impostor }), tag).toBe(false);
    expect(compare({ value: impostor }, { value: make() }), tag).toBe(false);
  }
});
it('keeps content comparison for built-ins from another realm and for subclasses', () => {
  const foreign: ReadonlyArray<readonly [string, unknown]> = [
    ['new Map([["a", { b: 1 }]])', new Map([['a', { b: 1 }]])],
    ['new Set([1, 2])', new Set([1, 2])],
    ['new Date(5)', new Date(5)],
    ['/a/g', /a/g],
    ['new Uint8Array([1, 2]).buffer', new Uint8Array([1, 2]).buffer],
    ['new Number(1)', Object(1)],
    ['new String("a")', Object('a')],
    ['new Boolean(true)', Object(true)],
    ['new Error("a")', new Error('a')],
    ['new Uint8Array([1, 2])', new Uint8Array([1, 2])],
    [
      'new DataView(new Uint8Array([1, 2]).buffer)',
      new DataView(new Uint8Array([1, 2]).buffer),
    ],
  ];
  for (const [source, local] of foreign) {
    const other: unknown = runInNewContext(source);
    expect(compare({ value: other }, { value: local }), source).toBe(true);
    expect(compare({ value: local }, { value: other }), source).toBe(true);
  }
  class LocalMap extends Map<string, number> {}
  class LocalDate extends Date {}
  class LocalError extends Error {}
  for (const make of [
    () => new LocalMap([['a', 1]]),
    () => new LocalDate(5),
    () => new LocalError('a'),
  ])
    expect(compare({ value: make() }, { value: make() })).toBe(true);
});
