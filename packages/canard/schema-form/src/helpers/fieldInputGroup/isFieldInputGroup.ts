import { isArraySchema, isStringSchema } from '@winglet/json-schema/filter';

import type { FieldNode } from '@/schema-form/core';

/**
 * Identify the schema shapes rendered as builtin checkbox or radio groups.
 * @param schema - Effective schema carrying the input presentation
 * @returns Whether the field title names an options group
 */
export const isFieldInputGroup = (schema: FieldNode['jsonSchema']): boolean => {
  if (typeof schema === 'boolean') return false;
  const presentation = schema.presentation;
  const inputType =
    typeof presentation === 'object' &&
    presentation !== null &&
    'inputType' in presentation
      ? presentation.inputType
      : undefined;
  if (isArraySchema(schema))
    return (
      inputType === 'checkbox' &&
      !!schema.items &&
      isStringSchema(schema.items) &&
      !!schema.items.enum?.length
    );
  return (
    isStringSchema(schema) &&
    (inputType === 'radio' || inputType === 'radiogroup') &&
    !!schema.enum?.length
  );
};
