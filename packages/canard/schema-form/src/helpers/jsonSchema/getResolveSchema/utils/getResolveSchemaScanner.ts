import { isEmptyObject } from '@winglet/common-utils/filter';
import { clone, merge } from '@winglet/common-utils/object';
import { JsonSchemaScanner } from '@winglet/json-schema/scanner';

import type { JsonSchema } from '@/schema-form/types';

export const getResolveSchemaScanner = (
  referenceTable: Map<string, JsonSchema>,
  maxDepth: number,
) =>
  new JsonSchemaScanner({
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
