import { expect } from 'vitest';

import type { FieldNode } from '@/schema-form/core/surface';

/**
 * Assert that an array item read its received null as a deliberately empty item.
 * @param item - Live item node at a non-nullable leaf position
 * @returns Nothing; fails unless the source and value are undefined and the item is no misfit
 */
export const expectEmptyItem = (item: FieldNode): void => {
  expect([item.source, item.value, item.isMisfit]).toEqual([
    undefined,
    undefined,
    false,
  ]);
};
