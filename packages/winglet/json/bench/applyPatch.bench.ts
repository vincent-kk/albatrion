import { bench, describe } from 'vitest';

import { applyPatch, Operation, type Patch } from '@/json';

/** A recursively nested plain object whose leaves are numbers. */
interface NestedDocument {
  [key: string]: NestedDocument | number;
}

/**
 * Builds a balanced document for patch measurements.
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

/**
 * Builds replace patches that all target leaves of the document.
 *
 * @param count - The number of patches to create
 * @returns Patches addressing distinct leaves
 */
const createPatches = (count: number): Patch[] =>
  Array.from({ length: count }, (_, index) => ({
    op: Operation.REPLACE,
    path: `/node${index % 4}/node${(index >> 2) % 4}/node0/node0`,
    value: index,
  }));

const document = createDocument(4, 4);
const onePatch = createPatches(1);
const tenPatches = createPatches(10);
const hundredPatches = createPatches(100);

describe('applyPatch — immutable clones the whole document per call', () => {
  bench('1 patch', () => {
    applyPatch(document, onePatch);
  });
  bench('10 patches', () => {
    applyPatch(document, tenPatches);
  });
  bench('100 patches', () => {
    applyPatch(document, hundredPatches);
  });
});

describe('applyPatch — immutable off', () => {
  bench('10 patches, mutating', () => {
    applyPatch(createDocument(4, 4), tenPatches, { immutable: false });
  });
});
