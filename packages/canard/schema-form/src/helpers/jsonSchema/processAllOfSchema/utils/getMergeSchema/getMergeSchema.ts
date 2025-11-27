import type { Fn } from '@aileron/declare';

import { extractSchemaInfo } from '@/schema-form/helpers/jsonSchema/extractSchemaInfo';
import type { JsonSchema } from '@/schema-form/types';

import {
  intersectArraySchema,
  intersectBooleanSchema,
  intersectNullSchema,
  intersectNumberSchema,
  intersectObjectSchema,
  intersectStringSchema,
} from './intersectSchema';

type MergeSchema = Fn<
  [base: JsonSchema, source: Partial<JsonSchema>],
  JsonSchema
>;

/**
 * Returns the appropriate schema intersection function based on the JSON Schema.
 * Each type has its own specialized merge logic for combining schemas in an allOf array.
 *
 * @param schema - The JSON Schema to get the merge function for
 * @returns The merge function for the given schema type, or null if no merge function exists
 */
export const getMergeSchema = (schema: JsonSchema): MergeSchema | null => {
  const info = extractSchemaInfo(schema);
  switch (info?.type) {
    case 'array':
      return intersectArraySchema as MergeSchema;
    case 'boolean':
      return intersectBooleanSchema as MergeSchema;
    case 'null':
      return intersectNullSchema as MergeSchema;
    case 'number':
    case 'integer':
      return intersectNumberSchema as MergeSchema;
    case 'object':
      return intersectObjectSchema as MergeSchema;
    case 'string':
      return intersectStringSchema as MergeSchema;
  }
  return null;
};
