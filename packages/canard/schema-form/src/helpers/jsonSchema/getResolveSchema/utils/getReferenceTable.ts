import { JsonSchemaScanner } from '@winglet/json-schema/scanner';
import { getValue } from '@winglet/json/pointer';

import type { JsonSchema } from '@/schema-form/types';

/**
 * Creates a reference table by scanning JSON Schema for $ref references
 *
 * @param jsonSchema - JSON Schema to scan for references
 * @returns Map of reference keys to resolved schema values, or null if no references found
 */
export const getReferenceTable = (jsonSchema: JsonSchema) => {
  const referenceTable = new Map<string, JsonSchema>();
  new JsonSchemaScanner<JsonSchema>({
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
