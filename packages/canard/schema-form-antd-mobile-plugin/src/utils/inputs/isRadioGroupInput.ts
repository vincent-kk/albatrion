import type { FieldInputHint } from '@canard/schema-form';

/** Match the exact schema contract used to select the FieldInputRadioGroup input. */
export const isRadioGroupInput = ({
  schemaType: type,
  inputType,
  jsonSchema,
}: Pick<FieldInputHint, 'schemaType' | 'inputType' | 'jsonSchema'>) => {
  return (
    (type === 'string' || type === 'number' || type === 'integer') &&
    (inputType === 'radio' || inputType === 'radiogroup') &&
    !!jsonSchema.enum?.length
  );
};
