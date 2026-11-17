import type { FieldInputDefinition } from '@/schema-form/types';

import { FieldInputBoolean } from './FieldInputBoolean';

/** Built-in boolean input; matches every boolean node. */
export const FieldInputBooleanDefinition = {
  Component: FieldInputBoolean,
  test: { type: 'boolean' },
} satisfies FieldInputDefinition;
