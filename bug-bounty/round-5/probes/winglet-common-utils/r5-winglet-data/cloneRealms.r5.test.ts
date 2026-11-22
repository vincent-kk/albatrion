import { createContext, runInContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

import { clone, equals, stableEquals } from '@/common-utils';

/** Evaluates one expression either with this realm's intrinsics or in a fresh realm. */
const make = (expression: string, foreign: boolean) => {
  const context = foreign
    ? createContext({})
    : createContext({ Map, Set, Date, RegExp, Error, AggregateError, ArrayBuffer, DataView, Uint8Array, Array, Object, Number, String, Boolean, Symbol });
  return runInContext(`(${expression})`, context);
};

const roundTrip = (value: unknown) => {
  const copy = clone(value);
  return { equals: equals(value, copy), stableEquals: stableEquals(value, copy) };
};

const cases: Record<string, string> = {
  'plain object': '{ a: 1, b: [1, { c: 2 }], d: { e: null } }',
  'sparse array': '(() => { const a = [1, , 3]; return a; })()',
  'Date': 'new Date(5)',
  'RegExp with lastIndex': '(() => { const r = /a+/g; r.lastIndex = 2; return r; })()',
  'Map with object values': "new Map([['k', { v: 1 }]])",
  'Set of primitives': "new Set([1, 'x'])",
  'Error with options cause': 'new Error("failed", { cause: { code: 7 } })',
  'AggregateError': 'new AggregateError([new Error("x")], "many")',
  'Uint8Array': 'new Uint8Array([1, 2, 3])',
  'ArrayBuffer': 'new Uint8Array([1, 2, 3]).buffer',
  'DataView': 'new DataView(new Uint8Array([1, 2, 3, 4]).buffer, 1, 2)',
  'boxed Number': 'new Number(5)',
  'null-prototype object': 'Object.assign(Object.create(null), { a: 1 })',
  'object with symbol key': '(() => { const s = Symbol.for("k"); return { [s]: 1, a: 2 }; })()',
  'regex match array': '"xaay".match(/(?<run>a+)/)',
};

describe('clone round trip: local against foreign realm (watch list: clone across realms)', () => {
  for (const [name, expression] of Object.entries(cases)) {
    it(`control: local ${name} round-trips under equals and stableEquals`, () => {
      expect(roundTrip(make(expression, false))).toEqual({ equals: true, stableEquals: true });
    });
    it(`foreign ${name} round-trips like the local one`, () => {
      expect(roundTrip(make(expression, true))).toEqual(roundTrip(make(expression, false)));
    });
  }
});
