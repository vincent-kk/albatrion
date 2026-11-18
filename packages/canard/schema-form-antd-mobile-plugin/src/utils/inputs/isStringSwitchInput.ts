import type { FieldInputHint } from '@canard/schema-form';

/**
 * Match the exact schema contract used to select the FieldInputStringSwitch input.
 * @param hint - Effective core input kind, schema and presentation; no values are coerced.
 * @returns Whether this input definition accepts the hint.
 */
export const isStringSwitchInput = ({
  type,
  inputType,
  jsonSchema,
}: Pick<FieldInputHint, 'type' | 'inputType' | 'jsonSchema'>) =>
  type === 'string' && inputType === 'switch' && jsonSchema.enum?.length === 2;
