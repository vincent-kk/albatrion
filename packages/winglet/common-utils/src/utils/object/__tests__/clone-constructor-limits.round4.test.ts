import { expect, it } from 'vitest';

import { clone } from '../clone';

it('keeps the recorded Error subclass constructor policy', () => {
  let constructions = 0;
  class Failure extends Error {
    constructor(message: string) { super(message); constructions++; }
  }
  const value = new Failure('failure');
  constructions = 0;
  const copy = clone(value);
  expect(constructions).toBe(1);
  expect(Object.getPrototypeOf(copy)).toBe(Failure.prototype);
  expect(copy.message).toBe(value.message);
});

it('keeps ArrayBuffer subclass species construction as an explicit limit', () => {
  let constructions = 0;
  class Storage extends ArrayBuffer {
    constructor(length: number) { super(length); constructions++; }
  }
  const value = new Storage(8);
  new Uint8Array(value)[2] = 7;
  constructions = 0;
  const copy = clone(value);
  expect(constructions).toBe(1);
  expect(Object.getPrototypeOf(copy)).toBe(Storage.prototype);
  expect(Array.from(new Uint8Array(copy))).toEqual(Array.from(new Uint8Array(value)));
  new Uint8Array(copy)[2] = 9;
  expect(new Uint8Array(value)[2]).toBe(7);
});
