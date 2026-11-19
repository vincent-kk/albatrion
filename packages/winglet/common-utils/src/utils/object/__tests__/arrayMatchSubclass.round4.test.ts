import { expect, it } from 'vitest';
import { clone } from '../clone';

it.each(['index', 'input', 'groups', '0'])('copies match metadata over a subclass accessor: %s', key => {
  class Match extends Array<unknown> {}
  Object.defineProperty(Match.prototype, key, { get: () => 'prototype' });
  const original = new Match('value');
  Object.defineProperty(original, key, { value: { field: 1 }, enumerable: true, configurable: true });
  const copy = clone(original);
  expect(Object.getPrototypeOf(copy)).toBe(Object.getPrototypeOf(original));
  expect(Reflect.get(copy, key)).toEqual(Reflect.get(original, key));
});

it.each(['null', 'missing constructor'])('retains an array prototype with %s', kind => {
  const prototype = kind === 'null' ? null : Object.create(Array.prototype);
  const original = [{ field: 1 }]; Object.setPrototypeOf(original, prototype);
  const copy = clone(original);
  expect(Object.getPrototypeOf(copy)).toBe(prototype);
  expect(Array.isArray(copy)).toBe(true);
  expect(copy[0]).toEqual(original[0]);
  expect(copy[0]).not.toBe(original[0]);
});
