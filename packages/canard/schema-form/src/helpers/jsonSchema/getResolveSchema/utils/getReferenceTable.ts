import { JsonSchemaScanner } from '@winglet/json-schema/scanner';
import { getValue } from '@winglet/json/pointer';

import type { JsonSchema } from '@/schema-form/types';

export const getReferenceTable = (jsonSchema: JsonSchema) => {
  const referenceTable = new Map<string, JsonSchema>();
  new JsonSchemaScanner({
    visitor: {
      exit: ({ schema, hasReference }) => {
        if (hasReference && typeof schema.$ref === 'string')
          referenceTable.set(schema.$ref, getValue(jsonSchema, schema.$ref));
      },
    },
  }).scan(jsonSchema);
  if (referenceTable.size === 0) return null;
  return referenceTable;
};
