import type { FieldInputDefinition } from '@/schema-form/types';

import { FieldInputVirtual } from './FieldInputVirtual';

/** Built-in virtual input; matches every virtual node. */
export const FieldInputVirtualDefinition = {
  Component: FieldInputVirtual,
  test: { type: 'virtual' },
} satisfies FieldInputDefinition;
