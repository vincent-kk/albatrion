import { bench, describe } from 'vitest';

import { equals } from '@/common-utils/utils/object/equals';

/** A recursively nested plain object whose leaves are numbers. */
interface NestedPlainObject {
  [key: string]: NestedPlainObject | number;
}

/**
 * Builds a balanced plain-object tree for deep-comparison measurements.
 *
 * @param depth - The positive number of object levels in the tree
 * @param width - The number of properties created on every object
 * @returns A nested plain object with numeric leaves
 */
const createNestedPlainObject = (
  depth: number,
  width: number,
): NestedPlainObject => {
  const node: NestedPlainObject = {};
  for (let index = 0; index < width; index++)
    node[`node${index}`] =
      depth === 1 ? index : createNestedPlainObject(depth - 1, width);
  return node;
};

/**
 * Builds a single-level object with the requested number of numeric properties.
 *
 * @param size - The number of properties to create
 * @returns A flat object whose values are their own index
 */
const createFlatObject = (size: number): Record<string, number> => {
  const node: Record<string, number> = {};
  for (let index = 0; index < size; index++) node[`key${index}`] = index;
  return node;
};

const deepLeft = createNestedPlainObject(4, 4);
const deepRight = createNestedPlainObject(4, 4);

/** Differs at the first compared key, so the walk stops immediately. */
const earlyMismatchLeft = { a: 1, ...createNestedPlainObject(4, 4) };
const earlyMismatchRight = { a: 2, ...createNestedPlainObject(4, 4) };

const flat50Left = createFlatObject(50);
const flat50Right = createFlatObject(50);
const flat500Left = createFlatObject(500);
const flat500Right = createFlatObject(500);

const OMITTED = ['key0', 'key1'] as const;
const OMITTED_SET = new Set<PropertyKey>(OMITTED);

describe('equals — nested plain objects, depth 4 width 4 (341 nodes)', () => {
  bench('fully equal trees (worst case: whole walk)', () =>
    equals(deepLeft, deepRight),
  );
  bench('mismatch at the first key (best case)', () =>
    equals(earlyMismatchLeft, earlyMismatchRight),
  );
});

describe('equals — flat objects', () => {
  bench('50 keys, equal', () => equals(flat50Left, flat50Right));
  bench('500 keys, equal', () => equals(flat500Left, flat500Right));
});

describe('equals — omit handling on a 50 key object', () => {
  bench('no omit', () => equals(flat50Left, flat50Right));
  bench('omit as array', () => equals(flat50Left, flat50Right, OMITTED));
  bench('omit as Set', () => equals(flat50Left, flat50Right, OMITTED_SET));
});
