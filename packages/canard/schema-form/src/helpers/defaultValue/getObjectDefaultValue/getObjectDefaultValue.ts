import { JsonSchemaScanner } from '@winglet/json-schema/scanner';
import { setValue } from '@winglet/json/pointer';

import type { ObjectSchema, ObjectValue } from '@/schema-form/types';

export const getObjectDefaultValue = (
  jsonSchema: ObjectSchema,
  inputDefault?: ObjectValue,
) => {
  const defaultValue: ObjectValue = inputDefault || jsonSchema.default || {};
  new JsonSchemaScanner({
    visitor: {
      enter: ({ schema, dataPath }) => {
        if ('default' in schema)
          setValue(defaultValue, dataPath, schema.default, false);
      },
    },
  }).scan(jsonSchema);

  return defaultValue;
};
