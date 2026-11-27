import type { FieldInputDefinition } from '@/schema-form/types';

import { FieldInputStringEnum } from './FieldInputStringEnum';

/** Built-in select; matches strings with a non-empty enum. */
export const FieldInputStringEnumDefinition = {
  Component: FieldInputStringEnum,
  test: ({ type, jsonSchema }) =>
    type === 'string' && !!jsonSchema.enum?.length,
} satisfies FieldInputDefinition;
