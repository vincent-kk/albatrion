import { isNumberSchema } from '@winglet/json-schema/filter';

import type { FieldInputHint } from '@canard/schema-form';

/** Match the exact schema contract used to select the FieldInputSlider input. */
export const isSliderInput = ({
  schemaType: type,
  jsonSchema,
  format,
}: Pick<FieldInputHint, 'schemaType' | 'jsonSchema' | 'format'>) => {
  return (
    ((type === 'number' || type === 'integer') && format === 'slider') ||
    (type === 'array' &&
      jsonSchema.items &&
      isNumberSchema(jsonSchema.items) &&
      format === 'slider')
  );
};
