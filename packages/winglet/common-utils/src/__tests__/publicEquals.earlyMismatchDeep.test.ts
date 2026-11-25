import { describe, expect, it } from 'vitest';

import { equals } from '../index';

/** Number of times any throwing getter of one case has run. */
type ReadCount = { value: number };

/** Builds the two operands of one case; their getters report to `reads`. */
type CaseOperands = (reads: ReadCount) => [left: unknown, right: unknown];

/** Number of array layers wrapped around each operand. */
const DEPTH = 300;

/**
 * Replaces an existing slot with an enumerable getter that counts its call and then
 * throws, so a comparison that reads the slot fails the case.
 *
 * @param target - Object whose slot keeps its position in the key order
 * @param key - Existing property key to replace
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
 * Asserts that `equals` answers `false` and that no getter of the case ran.
 *
 * @param operands - Case to compare
 */
const expectFalseWithoutReads = (operands: CaseOperands): void => {
  const reads: ReadCount = { value: 0 };
  const [left, right] = operands(reads);
  expect(equals(left, right)).toBe(false);
  expect(reads.value).toBe(0);
};

describe('equals stops at the first mismatch inside 300 array layers', () => {
  it('rejects { a: 1, b: get } against { a: 2, b: get } without reading the getter', () => {
    expectFalseWithoutReads(
      nested(
        (reads) => [
          withThrowingGetter({ a: 1, b: 0 }, 'b', reads),
          withThrowingGetter({ a: 2, b: 0 }, 'b', reads),
        ],
        DEPTH,
      ),
    );
  });

  it('rejects { y: 1, x: get } against { z: 1, x: get } without reading the getter', () => {
    expectFalseWithoutReads(
      nested(
        (reads) => [
          withThrowingGetter({ y: 1, x: 0 }, 'x', reads),
          withThrowingGetter({ z: 1, x: 0 }, 'x', reads),
        ],
        DEPTH,
      ),
    );
  });

  it('rejects two Maps whose first values differ without reading a later getter', () => {
    expectFalseWithoutReads(
      nested((reads) => {
        const holder = withThrowingGetter({ g: 0 }, 'g', reads);
        const otherHolder = withThrowingGetter({ g: 0 }, 'g', reads);
        return [
          new Map<string, unknown>([
            ['k1', 1],
            ['k2', holder],
          ]),
          new Map<string, unknown>([
            ['k1', 2],
            ['k2', otherHolder],
          ]),
        ];
      }, DEPTH),
    );
  });
});
