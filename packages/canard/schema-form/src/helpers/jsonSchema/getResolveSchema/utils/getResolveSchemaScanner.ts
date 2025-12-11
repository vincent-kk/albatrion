import { isEmptyObject } from '@winglet/common-utils/filter';
import { clone, merge } from '@winglet/common-utils/object';
import { JsonSchemaScanner } from '@winglet/json-schema/scanner';

import type { JsonSchema, JsonSchemaWithRef } from '@/schema-form/types';

/**
 * Creates a JSON Schema scanner configured for resolving $ref references
 *
 * @param referenceTable - Map containing reference keys and their resolved schemas
 * @param maxDepth - Maximum depth for reference resolution to prevent infinite recursion
 * @returns JsonSchemaScanner instance configured with reference resolution options
 */
export const getResolveSchemaScanner = (
  referenceTable: Map<string, JsonSchema>,
  maxDepth: number,
) =>
  new JsonSchemaScanner<JsonSchemaWithRef>({
    options: {
      resolveReference: (path, entry) => {
        const { $ref: _, ...preferredSchema } = entry.schema;
        const referenceSchema = referenceTable.get(path);
        if (referenceSchema === undefined) return;
        if (isEmptyObject(preferredSchema)) return referenceSchema;
        return merge(clone(referenceSchema), preferredSchema);
      },
      maxDepth,
    },
  });
