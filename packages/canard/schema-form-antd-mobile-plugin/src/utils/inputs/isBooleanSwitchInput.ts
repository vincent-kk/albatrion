import type { FieldInputHint } from '@canard/schema-form';

/** Match the exact schema contract used to select the FieldInputBooleanSwitch input. */
export const isBooleanSwitchInput = ({
  type,
  inputType,
}: Pick<FieldInputHint, 'type' | 'inputType'>) =>
  type === 'boolean' && inputType === 'switch';
