import type { FieldInputDefinition } from '@/schema-form/types';

import { FieldInputArray } from './FieldInputArray';

/** Built-in array input; matches every array node. */
export const FieldInputArrayDefinition = {
  Component: FieldInputArray,
  test: { type: 'array' },
} satisfies FieldInputDefinition;
