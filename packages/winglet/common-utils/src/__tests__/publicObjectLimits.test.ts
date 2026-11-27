import { runInNewContext } from 'node:vm';
import { expect, it } from 'vitest';

import { equals, isEmpty, merge, stableEquals } from '../index';

it.each([
  () => new Date(1),
  () => /x/g,
  () => new Set([1]),
  () => new Map([[1, 2]]),
])(
  'compares the native state of equal built-ins independently of extra keys',
  (make) => {
    const left = Object.assign(make(), { extra: 1 });
    const right = Object.assign(make(), { extra: 2 });
    expect(equals(left, right)).toBe(true);
    expect(stableEquals(left, right)).toBe(true);
  },
);

it('compares ArrayBuffer own keys but only bytes for native views', () => {
  const left = Object.assign(new ArrayBuffer(1), { extra: 1 });
  const right = Object.assign(new ArrayBuffer(1), { extra: 2 });
  expect(stableEquals(left, right)).toBe(false);
  expect(stableEquals(new DataView(left), new DataView(right))).toBe(true);
  expect(stableEquals(new Uint8Array(left), new Uint8Array(right))).toBe(true);
});

it('ignores an own prototype key when merging and preserves ordinary siblings', () => {
  const source = { ['__proto__']: { inherited: true }, value: 1 };
  const merged = merge({}, source);
  expect(Object.getPrototypeOf(merged)).toBe(Object.prototype);
  expect(Object.prototype.hasOwnProperty.call(merged, '__proto__')).toBe(false);
  expect(merged).toEqual({ value: 1 });
});

it.each(['new Map([[1, 2]])', 'new Set([1])'])(
  'keeps the documented foreign collection limit for %s',
  (value) => {
    expect(isEmpty(runInNewContext(value))).toBe(true);
    expect(isEmpty(runInNewContext(value, { Map, Set }))).toBe(false);
  },
);
