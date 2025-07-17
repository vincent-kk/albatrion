import { JsonSchemaScanner } from '@winglet/json-schema/scanner';

import type { JsonSchema } from '@/schema-form/types';

import { transformCondition } from './utils/transformCondition';

export const preprocessSchema = (schema: JsonSchema): JsonSchema =>
  scanner.scan(schema).getValue<JsonSchema>() || schema;

const scanner = new JsonSchemaScanner({
  options: {
    mutate: ({ schema }) => {
      if (schema.type !== 'object') return;
      if (!('virtual' in schema) || !('if' in schema)) return;
      if (schema.then)
        schema.then = transformCondition(schema.then, schema.virtual);
      if (schema.else)
        schema.else = transformCondition(schema.else, schema.virtual);
      return schema;
    },
  },
});
