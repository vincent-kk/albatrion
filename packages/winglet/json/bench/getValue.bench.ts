import { bench, describe } from 'vitest';

import { getValue } from '@/json';

/** A recursively nested plain object whose leaves are numbers. */
interface NestedDocument {
  [key: string]: NestedDocument | number;
}

/**
 * Builds a balanced document for pointer-read measurements.
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

describe('getValue — ordinary keys', () => {
  bench('shallow read (/node0)', () => {
    getValue(document, '/node0');
  });
  bench('deep read (4 segments)', () => {
    getValue(document, '/node2/node2/node2/node2');
  });
  bench('missing path read', () => {
    getValue(document, '/node0/absent/leaf');
  });
});
