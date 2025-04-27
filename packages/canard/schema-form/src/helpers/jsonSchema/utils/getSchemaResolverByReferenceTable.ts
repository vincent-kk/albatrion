import { JsonSchemaScanner } from '@winglet/json-schema';

import type { JsonSchema } from '@/schema-form/types';

export const getSchemaResolverByReferenceTable = (
  schemaTable: Map<string, JsonSchema>,
  maxDepth: number = 1,
) =>
  new JsonSchemaScanner({
    options: {
      resolveReference: (path) => schemaTable.get(path),
      maxDepth,
    },
  });
