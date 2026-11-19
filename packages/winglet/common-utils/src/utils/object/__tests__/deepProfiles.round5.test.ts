import { expect, it } from 'vitest';

import { clone } from '../clone';
import { stableEquals } from '../equals/utils/stableEquals';

/** A plain-container prefix whose leaf exercises a supported copy/comparison policy. */
type Link = { next?: Link; value?: unknown };

/** Wrap a leaf in depth plain containers without consuming the JavaScript call stack. */
const wrap = (value: unknown, depth = 20_000): Link => {
  let node: Link = { value };
  for (let index = 0; index < depth; index++) node = { next: node };
  return node;
};

/** Read a wrapped leaf iteratively so the test harness itself has no depth limit. */
const unwrap = (value: Link, depth = 20_000): unknown => {
  let node = value;
  for (let index = 0; index < depth; index++) {
    if (!node.next) throw new Error('missing link');
    node = node.next;
  }
  return node.value;
};

it('deep clones keep null prototypes, reserved data keys, shared values and array holes', () => {
  const symbol = Symbol('metadata');
  const shared = { marker: 7 };
  const leaf = Object.assign(Object.create(null), { first: shared, second: shared, rows: [1, , undefined] });
  Object.defineProperty(leaf, '__proto__', { value: shared, enumerable: true });
  leaf[symbol] = shared;
  const result = unwrap(clone(wrap(leaf)));
  if (typeof result !== 'object' || result === null) throw new Error('missing cloned leaf');
  expect(Object.getPrototypeOf(result)).toBe(null);
  expect(Reflect.get(result, 'first')).toBe(Reflect.get(result, 'second'));
  expect(Reflect.get(result, symbol)).toBe(Reflect.get(result, '__proto__'));
  expect(Reflect.get(result, 'first')).not.toBe(shared);
  const rows: unknown = Reflect.get(result, 'rows');
  if (!Array.isArray(rows)) throw new Error('missing cloned rows');
  expect(rows.length).toBe(3); expect(1 in rows).toBe(false); expect(2 in rows).toBe(true);
});

it('depth bounds retain root-relative sharing across the work-frame boundary', () => {
  const source = wrap({ value: 7 }, 400);
  for (const limit of [0, 1, 255, 256, 257, 300]) {
    let left = source, right = clone(source, limit);
    for (let index = 0; index < limit; index++) {
      expect(right).not.toBe(left);
      if (!left.next || !right.next) throw new Error('missing bounded link');
      left = left.next; right = right.next;
    }
    expect(right).toBe(left);
  }
});

it('stable comparison preserves hidden and symbol keys, omit sets and sparse-array distinctions at depth', () => {
  const symbol = Symbol('key');
  const left = { [symbol]: 1, volatile: 1 }, right = { [symbol]: 2, volatile: 2 };
  expect(stableEquals(wrap(left), wrap(right))).toBe(false);
  expect(stableEquals(wrap(left), wrap(right), [symbol, 'volatile'])).toBe(true);
  expect(stableEquals(wrap([1, , 3]), wrap([1, undefined, 3]))).toBe(false);
  expect(stableEquals(wrap([1, , 3]), wrap([1, , 3]))).toBe(true);
  Object.defineProperty(left, 'hidden', { value: 1 }); Object.defineProperty(right, 'hidden', { value: 2 });
  expect(stableEquals(wrap(left), wrap(right), [symbol, 'volatile'])).toBe(false);
});

it('deep work frames delegate built-in leaves to the existing state comparison', () => {
  for (const [left, right] of [[new Date(1), new Date(2)], [/a/, /b/], [new Map([['k', 1]]), new Map([['k', 2]])], [new Uint8Array([1]), new Uint8Array([2])]]) {
    expect(stableEquals(wrap(left), wrap(right))).toBe(stableEquals(left, right));
    expect(stableEquals(wrap(left), wrap(left))).toBe(true);
  }
});
