import type { FieldInputDefinition } from '@/schema-form/types';

import { FieldInputStringRadio } from './FieldInputStringRadio';

/** Built-in radio group; matches string enums whose inputType is radio or radiogroup. */
export const FieldInputStringRadioDefinition = {
  Component: FieldInputStringRadio,
  test: ({ type, inputType, jsonSchema }) =>
    type === 'string' &&
    (inputType === 'radio' || inputType === 'radiogroup') &&
    !!jsonSchema.enum?.length,
} satisfies FieldInputDefinition;
