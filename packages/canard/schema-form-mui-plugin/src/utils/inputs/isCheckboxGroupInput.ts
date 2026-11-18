import type { FieldInputHint } from '@canard/schema-form';
import { isStringSchema } from '@winglet/json-schema/filter';

/** Match the exact schema contract used to select the FieldInputStringCheckbox input. */
export const isCheckboxGroupInput = ({ type, inputType, jsonSchema }: Pick<FieldInputHint, 'type' | 'inputType' | 'jsonSchema'>) =>
    type === 'array' &&
    inputType === 'checkbox' &&
    isStringSchema(jsonSchema.items) &&
    !!jsonSchema.items?.enum?.length;
