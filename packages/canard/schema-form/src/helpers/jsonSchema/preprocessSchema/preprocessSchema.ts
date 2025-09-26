import { JsonSchemaScanner } from '@winglet/json-schema/scanner';

import type { JsonSchema } from '@/schema-form/types';

import { processOneOfSchema } from './utils/processOneOfSchema';
import { processVirtualSchema } from './utils/processVirtualSchema';

/**
 * Preprocesses a JSON Schema by applying transformations for virtual schemas and oneOf constructs.
 * Uses a JsonSchemaScanner to traverse the schema tree and apply mutations where needed.
 *
 * @param schema - The JSON Schema to preprocess
 * @returns The preprocessed schema with all transformations applied
 */
export const preprocessSchema = <Schema extends JsonSchema>(
  schema: Schema,
): Schema => scanner.scan(schema).getValue<Schema>() || schema;

const scanner = new JsonSchemaScanner({
  options: {
    mutate: (entry) => {
      let schema = entry.schema as Partial<JsonSchema>;
      let idle = true;
      if (schema.type === 'object') {
        const processed = processVirtualSchema(schema);
        schema = processed || schema;
        if (idle) idle = processed === null;
      }
      if (entry.keyword === 'oneOf') {
        schema = processOneOfSchema(schema, entry.variant);
        idle = false;
      }
      if (idle) return;
      return schema;
    },
  },
});
