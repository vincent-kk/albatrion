import { bench, describe } from 'vitest';

import { sortWithReference } from '@/common-utils';

/**
 * Builds a reference order of distinct string entries.
 *
 * @param size - The number of entries to create
 * @returns An array usable as the reference order
 */
const createReference = (size: number): string[] =>
  Array.from({ length: size }, (_, index) => `entry${index}`);

const reference5000 = createReference(5000);
const reference100 = createReference(100);

/** Only a handful of the reference entries appear, the sparse case. */
const sparseSource = ['entry4000', 'entry10', 'entry2500'];
/** Every reference entry appears, reversed so the sort has real work. */
const denseSource = [...reference100].reverse();

describe('sortWithReference — sparse source against a large reference', () => {
  bench('3 items, 5000 reference entries', () => {
    sortWithReference(sparseSource, reference5000);
  });
});

describe('sortWithReference — dense source', () => {
  bench('100 items, 100 reference entries', () => {
    sortWithReference(denseSource, reference100);
  });
});
