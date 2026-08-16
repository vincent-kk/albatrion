import { bench, describe } from 'vitest';

import { equals } from '@/common-utils/utils/object/equals';
import { stableEquals } from '@/common-utils/utils/object/stableEquals';

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

const deepLeft = createNestedPlainObject(4, 4);
const deepRight = createNestedPlainObject(4, 4);

/** A cycle, the structure the visited bookkeeping exists for. */
const cyclicLeft: Record<string, unknown> = { ...deepLeft };
const cyclicRight: Record<string, unknown> = { ...deepRight };
cyclicLeft.self = cyclicLeft;
cyclicRight.self = cyclicRight;

describe('stableEquals — nested plain objects, depth 4 width 4 (341 nodes)', () => {
  bench('stableEquals, fully equal trees', () =>
    stableEquals(deepLeft, deepRight),
  );
  bench('equals, same input for reference', () => equals(deepLeft, deepRight));
});

describe('stableEquals — cyclic structures', () => {
  bench('fully equal cyclic trees', () =>
    stableEquals(cyclicLeft, cyclicRight),
  );
});
