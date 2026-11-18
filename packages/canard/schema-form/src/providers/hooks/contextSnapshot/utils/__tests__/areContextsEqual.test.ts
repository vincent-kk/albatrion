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
