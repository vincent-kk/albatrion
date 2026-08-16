import { bench, describe } from 'vitest';

import { stableSerialize } from '@/common-utils/utils/object/stableSerialize';

/** A recursively nested plain object whose leaves are numbers. */
interface NestedPlainObject {
  [key: string]: NestedPlainObject | number;
}

/**
 * Builds a balanced plain-object tree for serialization measurements.
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

/** Serialized repeatedly, so every call after the first can reuse prior work. */
const repeatedInput = createNestedPlainObject(4, 4);

/** A pool of distinct inputs, so no call can reuse another call's work. */
const distinctInputs = Array.from({ length: 64 }, () =>
  createNestedPlainObject(4, 4),
);
let cursor = 0;

const OMITTED = ['node0', 'node1'] as const;

describe('stableSerialize — depth 4, width 4 plain object (341 nodes)', () => {
  bench('same input every call', () => stableSerialize(repeatedInput));
  bench('a different input every call', () => {
    stableSerialize(distinctInputs[cursor++ % distinctInputs.length]);
  });
  bench('same input with omit', () => stableSerialize(repeatedInput, OMITTED));
});
