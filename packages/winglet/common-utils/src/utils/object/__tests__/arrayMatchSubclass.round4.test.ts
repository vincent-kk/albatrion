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

it.each(['base constructor', 'forged constructor', 'throwing accessor'])('retains an array prototype with a %s', kind => {
  let calls = 0;
  const prototype = Object.create(Array.prototype);
  prototype.marker = () => 7;
  function Forged() { calls++; throw new Error('constructor called'); }
  Forged.prototype = prototype;
  Object.defineProperty(prototype, 'constructor', kind === 'throwing accessor'
    ? { get() { calls++; throw new Error('accessor called'); } }
    : { value: kind === 'base constructor' ? Array : Forged });
  const original = Object.setPrototypeOf([1, 2], prototype);
  const copy = clone(original);
  expect(calls).toBe(0);
  expect(Object.getPrototypeOf(copy)).toBe(prototype);
  expect(Reflect.get(copy, 'marker')()).toBe(7);
  expect(Array.from(copy)).toEqual([1, 2]);
});
