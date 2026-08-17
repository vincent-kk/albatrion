import { bench, describe } from 'vitest';

import { setValue } from '@/json';

/** A recursively nested plain object whose leaves are numbers. */
interface NestedDocument {
  [key: string]: NestedDocument | number;
}

/**
 * Builds a balanced document for pointer-write measurements.
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

describe('setValue — ordinary keys, existing paths', () => {
  bench('shallow overwrite (/node0)', () => {
    setValue(document, '/node0', 1);
  });
  bench('deep overwrite (4 segments)', () => {
    setValue(document, '/node1/node1/node1/node1', 1);
  });
  bench('deep create then overwrite (missing branch)', () => {
    setValue(document, '/extra/branch/leaf', 1);
  });
});
