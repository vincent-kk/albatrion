import { bench, describe } from 'vitest';

import { mergePatch } from '@/json';

/** A recursively nested plain object whose leaves are numbers. */
interface NestedDocument {
  [key: string]: NestedDocument | number;
}

/**
 * Builds a balanced document for merge-patch measurements.
 *
 * @param depth - The positive number of object levels
 * @param width - The number of properties created on every object
 * @returns A nested document with numeric leaves
 */
const createDocument = (depth: number, width: number): NestedDocument => {
  const node: NestedDocument = {};
  for (let index = 0; index < width; index++)
    node[`node${index}`] =
      depth === 1 ? index : createDocument(depth - 1, width);
  return node;
};

const document = createDocument(4, 4);
const shallowPatch: NestedDocument = { node0: 1, node1: 2 };
const nestedPatch: NestedDocument = {
  node0: { node0: { node0: { node0: 1 } } },
  node3: { node3: 99 },
};

describe('mergePatch — ordinary keys, immutable clones source and patch', () => {
  bench('shallow patch', () => {
    mergePatch(document, shallowPatch);
  });
  bench('nested patch', () => {
    mergePatch(document, nestedPatch);
  });
});

describe('mergePatch — ordinary keys, mutating', () => {
  bench('nested patch, immutable off', () => {
    mergePatch(createDocument(4, 4), nestedPatch, false);
  });
});
