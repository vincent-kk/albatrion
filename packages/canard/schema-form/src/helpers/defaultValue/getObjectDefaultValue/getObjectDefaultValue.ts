import { setValueByPointer } from '@winglet/common-utils';
import { JsonSchemaScanner } from '@winglet/json-schema';

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
          setValueByPointer(defaultValue, dataPath, schema.default, false);
      },
    },
  }).scan(jsonSchema);

  return defaultValue;
};
