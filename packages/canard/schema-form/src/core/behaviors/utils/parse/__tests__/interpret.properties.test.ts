import { readFileSync } from 'node:fs';

import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import type { UnionSpec } from '../../../../record';
import { convert } from '../convert';
import { interpret } from '../interpret';
import { isMember } from '../isMember';

/** The six non-null JSON kinds in the reference exhaustive check. */
const KINDS = ['string', 'number', 'integer', 'boolean', 'object', 'array'] as const;
/** Representative scalar and reference values from the rule A check. */
const VALUES: readonly unknown[] = [
  undefined, null, '', ' ', 'abc', '42', ' 42 ', '4.2', '1e2', '1.0',
  '-0', '01', '9007199254740993', '1e16', '1e400', 'true', 'false',
  'True', ' true', '0', '1', 0, -0, 1, 2, 12.5, NaN, Infinity,
  -Infinity, 2 ** 60, 1e300, true, false, {}, { a: 1 }, [], [1],
  new Date(0), Object.create(null), 10n,
];

/** Enumerate each order of one allowed kind set. */
const permutations = <T>(items: readonly T[]): T[][] =>
  items.length < 2
    ? [Array.from(items)]
    : items.flatMap((item, index) =>
        permutations(items.filter((_, position) => position !== index)).map(
          (rest) => [item, ...rest],
        ),
      );

/** Make the immutable parse input used by both scalar and union calls. */
const spec = (kinds: UnionSpec['kinds'], nullable = false): UnionSpec => ({
  kinds,
  mask: 0,
  nullable,
});

describe('rule A exhaustive properties', () => {
  it('is order independent, idempotent, and yields a member after conversion', () => {
    let ambiguous = 0;
    for (let mask = 1; mask < 1 << KINDS.length; mask++) {
      const kinds = KINDS.filter((_, index) => (mask & (1 << index)) !== 0);
      const orders = permutations(kinds);
      for (const nullable of [false, true]) {
        for (const value of VALUES) {
          const base = interpret(value, spec(kinds, nullable));
          for (const order of orders)
            expect(Object.is(interpret(value, spec(order, nullable)), base)).toBe(true);
          expect(Object.is(interpret(base, spec(kinds, nullable)), base)).toBe(true);
          if (!Object.is(base, value))
            expect(kinds.some((kind) => isMember(base, kind))).toBe(true);
          if (!nullable && value !== undefined && value !== null &&
            !kinds.some((kind) => isMember(value, kind))) {
            const outcomes = kinds
              .map((kind) => ({ kind, candidate: convert(value, kind) }))
              .filter(({ kind, candidate }) => isMember(candidate, kind))
              .map(({ candidate }) => candidate);
            const unique = outcomes.filter(
              (candidate, index) => outcomes.indexOf(candidate) === index,
            );
            if (unique.length > 1) {
              ambiguous++;
              expect(base).toBe(value);
            }
          }
        }
      }
    }
    expect(ambiguous).toBe(12);
  });

  it('preserves all twelve ambiguous cases', () => {
    for (const extra of [[], ['object'], ['array'], ['object', 'array']] as const) {
      const kinds = [...extra, 'string', 'boolean'] as const;
      for (const value of [0, -0, 1]) {
        expect(Object.is(interpret(value, spec(kinds)), value)).toBe(true);
      }
    }
  });

  it('gives a one-element list the same result as a scalar kind', () => {
    for (const kind of KINDS) {
      for (const value of VALUES) {
        expect(Object.is(interpret(value, spec([kind])), interpret(value, spec(kind)))).toBe(true);
      }
    }
  });

  it('retains reference inputs without cloning them', () => {
    const object = { nested: true };
    const array = [object];
    const kinds = ['number', 'boolean'] as const;
    expect(interpret(object, spec(kinds))).toBe(object);
    expect(interpret(array, spec(kinds))).toBe(array);
    expect(interpret('not a number', spec(kinds))).toBe('not a number');
  });

  it('creates no candidate container or new object on the interpret write path', () => {
    const source = ts.createSourceFile(
      'interpret.ts',
      readFileSync(new URL('../interpret.ts', import.meta.url), 'utf8'),
      ts.ScriptTarget.Latest,
    );
    let allocations = 0;
    /** Count explicit allocation nodes in the per-write implementation. */
    const visit = (node: ts.Node): void => {
      if (ts.isArrayLiteralExpression(node) || ts.isObjectLiteralExpression(node) ||
        ts.isNewExpression(node)) allocations++;
      ts.forEachChild(node, visit);
    };
    visit(source);
    expect(allocations).toBe(0);
  });
});
