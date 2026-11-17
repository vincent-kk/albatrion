import type { BlueprintSchema } from '../../blueprint';
import { createTestTree } from './createTestTree';

/**
 * Create two gated item folds under one array host for engine regression tests.
 * @param keyword - Repeated template or first prefix position to exercise
 * @param itemControls - Optional own-item controls shared by both candidates
 * @param fragmentControls - Optional controls contributed by the first and second fragments
 * @returns Plain runtime tree and analysis; callers mount their chosen gate state
 */
export const createItemFoldTree = (
  keyword: 'items' | 'prefixItems',
  itemControls?: Record<string, unknown>,
  fragmentControls?: readonly [
    Record<string, unknown>,
    Record<string, unknown>,
  ],
) => {
  const first = {
    type: 'string',
    ...(itemControls ? { controls: itemControls } : {}),
  };
  const second = {
    type: 'number',
    ...(itemControls ? { controls: itemControls } : {}),
  };
  const schema: BlueprintSchema = {
    type: 'object',
    properties: {
      a: { type: 'boolean' },
      b: { type: 'boolean' },
      list: {
        type: 'array',
        allOf: [
          {
            controls: { ...fragmentControls?.[0], active: '../a' },
            [keyword]: keyword === 'items' ? first : [first],
          },
          {
            controls: { ...fragmentControls?.[1], active: '../b' },
            [keyword]: keyword === 'items' ? second : [second],
          },
        ],
      },
    },
  };
  return createTestTree(schema);
};
