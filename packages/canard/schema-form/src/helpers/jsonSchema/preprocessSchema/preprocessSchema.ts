import { JsonSchemaScanner } from '@winglet/json-schema/scanner';

import type { JsonSchema } from '@/schema-form/types';

import { transformCondition } from './utils/transformCondition';

export const preprocessSchema = <Schema extends JsonSchema>(
  schema: Schema,
): Schema => scanner.scan(schema).getValue<Schema>() || schema;

const scanner = new JsonSchemaScanner({
  options: {
    mutate: ({ schema }) => {
      if (schema.type !== 'object') return;
      if (!('virtual' in schema)) return;
      if ('required' in schema)
        schema = transformCondition(schema as JsonSchema, schema.virtual);
      if (schema.then)
        schema.then = transformCondition(schema.then, schema.virtual);
      if (schema.else)
        schema.else = transformCondition(schema.else, schema.virtual);
      return schema;
    },
  },
});
