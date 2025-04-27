import { JsonSchemaScanner } from '@winglet/json-schema';

import type { JsonSchema } from '@/schema-form/types';

export const getResolveSchemaScanner = (
  referenceTable: Map<string, JsonSchema>,
  maxDepth: number,
) =>
  new JsonSchemaScanner({
    options: {
      resolveReference: (path) => referenceTable.get(path),
      maxDepth,
    },
  });
