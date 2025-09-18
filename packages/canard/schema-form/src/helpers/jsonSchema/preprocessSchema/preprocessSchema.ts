import { JsonSchemaScanner } from '@winglet/json-schema/scanner';

import type { JsonSchema } from '@/schema-form/types';

import { processVirtualSchema } from './utils/processVirtualSchema';

export const preprocessSchema = <Schema extends JsonSchema>(
  schema: Schema,
): Schema => scanner.scan(schema).getValue<Schema>() || schema;

const scanner = new JsonSchemaScanner({
  options: {
    mutate: (entry) => {
      let schema = entry.schema as Partial<JsonSchema>;
      const processedVirtual = processVirtualSchema(schema);
      if (processedVirtual) return processedVirtual;
      return;
    },
  },
});
