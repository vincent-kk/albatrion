import { expect, it } from 'vitest';
import { clone } from '../clone';

it.each(['index', 'input', 'groups'])('copies match metadata over a subclass accessor: %s', key => {
  class Match extends Array<unknown> {}
  Object.defineProperty(Match.prototype, key, { get: () => 'prototype' });
  const original = new Match('value');
  Object.defineProperty(original, key, { value: { field: 1 }, enumerable: true, configurable: true });
  const copy = clone(original);
  expect(Object.getPrototypeOf(copy)).toBe(Object.getPrototypeOf(original));
  expect(Reflect.get(copy, key)).toEqual(Reflect.get(original, key));
});
