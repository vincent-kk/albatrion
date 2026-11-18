import type { FieldInputHint } from '@canard/schema-form';

/**
 * Match the exact schema contract used to select the FieldInputBooleanSwitch input.
 * @param hint - Effective core input kind, schema and presentation; no values are coerced.
 * @returns Whether this input definition accepts the hint.
 */
export const isBooleanSwitchInput = ({
  type,
  inputType,
}: Pick<FieldInputHint, 'type' | 'inputType'>) =>
  type === 'boolean' && inputType === 'switch';
