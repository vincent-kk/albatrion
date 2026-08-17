import { bench, describe } from 'vitest';

import { merge } from '@/common-utils/utils/object/merge';

/** A recursively nested plain object whose leaves are numbers. */
interface NestedPlainObject {
  [key: string]: NestedPlainObject | number;
}

/**
 * Builds a balanced plain-object tree for merge measurements.
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

const overlaySource = createNestedPlainObject(4, 4);
const flatSource = createFlatObject(200);
const arraySource = { items: Array.from({ length: 200 }, (_, i) => i) };

describe('merge — settings overlay, depth 4 width 4 (341 nodes)', () => {
  bench('into an empty target', () => {
    merge({}, overlaySource);
  });
  bench('into a fully populated target', () => {
    merge(createNestedPlainObject(4, 4), overlaySource);
  });
});

describe('merge — flat and array shapes', () => {
  bench('200 flat keys', () => {
    merge({}, flatSource);
  });
  bench('200 element array', () => {
    merge({}, arraySource);
  });
});
