import { getValueByPointer, isString } from '@winglet/common-utils';
import { JsonSchemaScanner } from '@winglet/json-schema';

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
