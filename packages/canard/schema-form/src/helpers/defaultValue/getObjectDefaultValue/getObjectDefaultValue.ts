import { isEmptyObject } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { JsonSchemaScanner } from '@winglet/json-schema/scanner';
import { setValue } from '@winglet/json/pointer';

import type { Nullish } from '@aileron/declare';

import type { ObjectSchema, ObjectValue } from '@/schema-form/types';

export const getObjectDefaultValue = (
  jsonSchema: ObjectSchema,
  inputDefault?: ObjectValue | Nullish,
) => {
  const defaultValue =
    inputDefault !== undefined ? inputDefault : jsonSchema.default;
  const result = defaultValue || {};
  new JsonSchemaScanner({
    visitor: {
      enter: ({ schema, dataPath }) => {
        if (hasOwnProperty(schema, 'default'))
          setValue(result, dataPath, schema.default, SET_VALUE_OPTIONS);
      },
    },
  }).scan(jsonSchema);
  if (isEmptyObject(result)) return defaultValue;
  return result;
};

const SET_VALUE_OPTIONS = {
  overwrite: false,
  preserveNull: false,
};
