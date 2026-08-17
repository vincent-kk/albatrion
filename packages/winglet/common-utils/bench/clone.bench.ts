import { bench, describe } from 'vitest';

import { clone } from '@/common-utils/utils/object/clone';
import { cloneLite } from '@/common-utils/utils/object/cloneLite';

/** A recursively nested plain object whose leaves are numbers. */
interface NestedPlainObject {
  [key: string]: NestedPlainObject | number;
}

/**
 * Builds a balanced plain-object tree for deep-clone measurements.
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

/** Shared 341-node input, created once so construction is outside benchmark timing. */
const deepObject = createNestedPlainObject(4, 4);

describe('deep clone — depth 4, width 4 plain object (341 nodes)', () => {
  bench('clone', () => {
    clone(deepObject);
  });
  bench('cloneLite', () => {
    cloneLite(deepObject);
  });
  bench('structuredClone', () => {
    structuredClone(deepObject);
  });
});
