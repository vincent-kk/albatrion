import type { FieldInputDefinition } from '@/schema-form/types';

import { FieldInputObject } from './FieldInputObject';

/** Built-in object input; matches every object node. */
export const FieldInputObjectDefinition = {
  Component: FieldInputObject,
  test: { type: 'object' },
} satisfies FieldInputDefinition;
