import type { FieldInputDefinition } from '@/schema-form/types';

import { FieldInputNumber } from './FieldInputNumber';

/** Built-in number input; matches every number node. */
export const FieldInputNumberDefinition = {
  Component: FieldInputNumber,
  test: { type: 'number' },
} satisfies FieldInputDefinition;
