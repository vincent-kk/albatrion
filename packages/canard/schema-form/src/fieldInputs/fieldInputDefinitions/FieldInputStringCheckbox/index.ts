import { isStringSchema } from '@winglet/json-schema/filter';

import type { FieldInputDefinition } from '@/schema-form/types';

import { FieldInputStringCheckbox } from './FieldInputStringCheckbox';

/** Built-in checkbox group; matches arrays whose items are a string enum and whose inputType is checkbox. */
export const FieldInputStringCheckboxDefinition = {
  Component: FieldInputStringCheckbox,
  test: ({ type, inputType, jsonSchema }) =>
    type === 'array' &&
    inputType === 'checkbox' &&
    isStringSchema(jsonSchema.items) &&
    !!jsonSchema.items?.enum?.length,
} satisfies FieldInputDefinition;
