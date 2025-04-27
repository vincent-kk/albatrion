import { JsonSchemaScanner } from '@winglet/json-schema';

import type { JsonSchema } from '@/schema-form/types';

export const getSchemaResolver = (schemaTable: Map<string, JsonSchema>) =>
  new JsonSchemaScanner({
    options: {
      resolveReference: (path) => schemaTable.get(path),
    },
  });
