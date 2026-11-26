import { describe, expect, it } from 'vitest';

import { equals, stableEquals } from '../index';

/** Number of times any throwing getter of one case has run. */
type ReadCount = { value: number };

/** Builds the two operands of one case; their getters report to `reads`. */
type CaseOperands = (reads: ReadCount) => [left: unknown, right: unknown];

/** One public comparison policy called with an optional omit list. */
type Comparison = (
  left: unknown,
  right: unknown,
  omit?: readonly PropertyKey[],
) => boolean;

/**
 * Replaces an existing slot with an enumerable getter that counts its call and then
 * throws, so a comparison that reads the slot fails the case.
 *
 * @param target - Object or array whose slot keeps its position in the key order
 * @param key - Existing property key or array index to replace
 * @param reads - Counter shared by every getter of the case
 * @returns `target`, now carrying the getter
 */
const withThrowingGetter = <Target extends object>(
  target: Target,
  key: PropertyKey,
  reads: ReadCount,
): Target =>
  Object.defineProperty(target, key, {
    enumerable: true,
    get() {
      reads.value++;
      throw new Error('a later sibling was read after an earlier mismatch');
    },
  });

/**
 * Wraps both operands of a case in the same number of single-element arrays.
 *
 * @param operands - Case whose operands become the innermost values
 * @param depth - Number of array layers added around each operand
 * @returns A case with the wrapped operands
 */
const nested =
  (operands: CaseOperands, depth: number): CaseOperands =>
  (reads) => {
    let [left, right] = operands(reads);
    for (let layer = 0; layer < depth; layer++) {
      left = [left];
      right = [right];
    }
    return [left, right];
  };

/**
 * Asserts that a comparison answers `false` and that no getter of the case ran.
 *
 * @param compare - Public comparison under test
 * @param operands - Case to compare
 * @param omit - Keys excluded from the comparison
 */
const expectFalseWithoutReads = (
  compare: Comparison,
  operands: CaseOperands,
  omit?: readonly PropertyKey[],
): void => {
  const reads: ReadCount = { value: 0 };
  const [left, right] = operands(reads);
  expect(compare(left, right, omit)).toBe(false);
  expect(reads.value).toBe(0);
};

/** `[1, get]` against `[2, get]`. */
const arrayMismatch: CaseOperands = (reads) => [
  withThrowingGetter([1, 0], 1, reads),
  withThrowingGetter([2, 0], 1, reads),
];

/** `[{ x: 1 }, get]` against `[{ x: 2 }, get]`. */
const nestedValueMismatch: CaseOperands = (reads) => [
  withThrowingGetter([{ x: 1 }, 0], 1, reads),
  withThrowingGetter([{ x: 2 }, 0], 1, reads),
];

/** `{ a: 1, b: get }` against `{ a: 2, b: get }`. */
const objectMismatch: CaseOperands = (reads) => [
  withThrowingGetter({ a: 1, b: 0 }, 'b', reads),
  withThrowingGetter({ a: 2, b: 0 }, 'b', reads),
];

/** `{ y: 1, x: get }` against `{ z: 1, x: get }`. */
const missingKeyMismatch: CaseOperands = (reads) => [
  withThrowingGetter({ y: 1, x: 0 }, 'x', reads),
  withThrowingGetter({ z: 1, x: 0 }, 'x', reads),
];

describe('equals stops at the first mismatch', () => {
  it.each<[string, CaseOperands]>([
    ['[1, get] against [2, get]', arrayMismatch],
    ['[{ x: 1 }, get] against [{ x: 2 }, get]', nestedValueMismatch],
    ['{ a: 1, b: get } against { a: 2, b: get }', objectMismatch],
    ['{ y: 1, x: get } against { z: 1, x: get }', missingKeyMismatch],
    [
      '[1, get] against [2, get] inside 100000 array layers',
      nested(arrayMismatch, 100000),
    ],
  ])('%s is false without reading the later getter', (_name, operands) =>
    expectFalseWithoutReads(equals, operands),
  );
});

describe('stableEquals stops at the first mismatch beyond its recursive depth', () => {
  it.each<[string, CaseOperands]>([
    ['[1, get] against [2, get]', arrayMismatch],
    ['{ a: 1, b: get } against { a: 2, b: get }', objectMismatch],
    ['[{ x: 1 }, get] against [{ x: 2 }, get]', nestedValueMismatch],
  ])(
    '%s inside 300 array layers is false without reading the later getter',
    (_name, operands) =>
      expectFalseWithoutReads(stableEquals, nested(operands, 300)),
  );
});

describe.each<[string, Comparison]>([
  ['equals', equals],
  ['stableEquals', stableEquals],
])(
  '%s rejects a size difference before reading any value',
  (_policy, compare) => {
    it.each<[string, CaseOperands, readonly PropertyKey[] | undefined]>([
      [
        '[get] against [get, 1]',
        (reads) => [
          withThrowingGetter([0], 0, reads),
          withThrowingGetter([0, 1], 0, reads),
        ],
        undefined,
      ],
      [
        '{ a: get } against { a: get, b: 1 }',
        (reads) => [
          withThrowingGetter({ a: 0 }, 'a', reads),
          withThrowingGetter({ a: 0, b: 1 }, 'a', reads),
        ],
        undefined,
      ],
      [
        "{ a: get, c: 1 } against { a: get, d: 1, e: 2 } omitting 'c'",
        (reads) => [
          withThrowingGetter({ a: 0, c: 1 }, 'a', reads),
          withThrowingGetter({ a: 0, d: 1, e: 2 }, 'a', reads),
        ],
        ['c'],
      ],
    ])('%s is false', (_name, operands, omit) =>
      expectFalseWithoutReads(compare, operands, omit),
    );
  },
);
