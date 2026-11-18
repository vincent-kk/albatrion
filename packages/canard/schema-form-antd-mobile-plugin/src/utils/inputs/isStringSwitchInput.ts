import type { FieldInputHint } from '@canard/schema-form';

/** Match the exact schema contract used to select the FieldInputStringSwitch input. */
export const isStringSwitchInput = ({
  type,
  inputType,
  jsonSchema,
}: Pick<FieldInputHint, 'type' | 'inputType' | 'jsonSchema'>) =>
  type === 'string' && inputType === 'switch' && jsonSchema.enum?.length === 2;
