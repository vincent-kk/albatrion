import { JSONSchemaScanner } from '@winglet/json-schema/scanner';
import { getValue } from '@winglet/json/pointer';

import type { JSONSchema } from '@/schema-form/types';

/**
 * Creates a reference table by scanning JSON Schema for $ref references
 *
 * @param jsonSchema - JSON Schema to scan for references
 * @returns Map of reference keys to resolved schema values, or null if no references found
 */
export const getReferenceTable = (jsonSchema: JSONSchema) => {
  const referenceTable = new Map<string, JSONSchema>();
  new JSONSchemaScanner<JSONSchema>({
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
