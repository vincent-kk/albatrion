import { isObjectSchema } from '@winglet/json-schema/filter';
import { JSONSchemaScanner } from '@winglet/json-schema/scanner';

import type { JSONSchema } from '@/schema-form/types';

import { processOneOfSchema } from './utils/processOneOfSchema';
import { processVirtualSchema } from './utils/processVirtualSchema';

/**
 * Preprocesses a JSON Schema by applying transformations for virtual schemas and oneOf constructs.
 * Uses a JSONSchemaScanner to traverse the schema tree and apply mutations where needed.
 *
 * @param schema - The JSON Schema to preprocess
 * @returns The preprocessed schema with all transformations applied
 */
export const preprocessSchema = <Schema extends JSONSchema>(
  schema: Schema,
): Schema => scanner.scan(schema).getValue() || schema;

const scanner = new JSONSchemaScanner<Partial<JSONSchema>>({
  options: {
    mutate: (entry) => {
      let schema = entry.schema;
      let idle = true;
      if (isObjectSchema(schema)) {
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
