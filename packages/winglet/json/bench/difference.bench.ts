import { bench, describe } from 'vitest';

import { compare } from '@/json/JSONPointer/utils/patch/compare/compare';
import { difference } from '@/json/JSONPointer/utils/patch/difference/difference';

/** A recursively nested plain object whose leaves are numbers. */
interface NestedDocument {
  [key: string]: NestedDocument | number | number[];
}

/**
 * Builds a balanced document, optionally giving every leaf node an array member so the
 * array-specific branch of `difference` is exercised.
 *
 * @param depth - The positive number of object levels
 * @param width - The number of properties created on every object
 * @param withArrays - Whether leaf nodes carry an array
 * @param seed - Shifts leaf values so two documents differ
 * @returns A nested document
 */
const createDocument = (
  depth: number,
  width: number,
  withArrays: boolean,
  seed = 0,
): NestedDocument => {
  const node: NestedDocument = {};
  for (let index = 0; index < width; index++)
    node[`node${index}`] =
      depth === 1
        ? index + seed
        : createDocument(depth - 1, width, withArrays, seed);
  if (withArrays && depth === 2) node.list = [1 + seed, 2, 3];
  return node;
};

const plainSource = createDocument(4, 4, false);
const plainTarget = createDocument(4, 4, false, 1);
const arraySource = createDocument(4, 4, true);
const arrayTarget = createDocument(4, 4, true, 1);

describe('difference — against compare, which it runs internally', () => {
  bench('difference, no arrays', () => {
    difference(plainSource, plainTarget);
  });
  bench('compare, same input', () => {
    compare(plainSource, plainTarget);
  });
});

describe('difference — array-bearing documents', () => {
  bench('difference, with arrays', () => {
    difference(arraySource, arrayTarget);
  });
});
