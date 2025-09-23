import { hasOwnProperty } from '@winglet/common-utils/lib';
import { JsonSchemaScanner } from '@winglet/json-schema/scanner';
import { setValue } from '@winglet/json/pointer';

import type { Nullish } from '@aileron/declare';

import type { ObjectSchema, ObjectValue } from '@/schema-form/types';

export const getObjectDefaultValue = (
  jsonSchema: ObjectSchema,
  inputDefault?: ObjectValue | Nullish,
) => {
  const defaultValue: ObjectValue = inputDefault || jsonSchema.default || {};
  new JsonSchemaScanner({
    visitor: {
      enter: ({ schema, dataPath }) => {
        if (hasOwnProperty(schema, 'default'))
          setValue(defaultValue, dataPath, schema.default, false);
      },
    },
  }).scan(jsonSchema);

  return defaultValue;
};
