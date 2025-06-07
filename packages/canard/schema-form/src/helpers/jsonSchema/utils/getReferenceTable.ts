import { isString } from '@winglet/common-utils/filter';
import { JsonSchemaScanner } from '@winglet/json-schema';
import { getValueByPointer } from '@winglet/json/pointer';

import type { JsonSchema } from '@/schema-form/types';

export const getReferenceTable = (jsonSchema: JsonSchema) => {
  const referenceTable = new Map<string, JsonSchema>();
  new JsonSchemaScanner({
    visitor: {
      exit: ({ schema, hasReference }) => {
        if (hasReference && isString(schema.$ref))
          referenceTable.set(
            schema.$ref,
            getValueByPointer(jsonSchema, schema.$ref),
          );
      },
    },
  }).scan(jsonSchema);
  if (referenceTable.size === 0) return null;
  return referenceTable;
};
