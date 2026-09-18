import type { Fn } from '@aileron/declare';

import { extractSchemaInfo } from '@/schema-form/helpers/jsonSchema/extractSchemaInfo';
import type { JSONSchema } from '@/schema-form/types';

import {
  intersectArraySchema,
  intersectBooleanSchema,
  intersectNullSchema,
  intersectNumberSchema,
  intersectObjectSchema,
  intersectStringSchema,
} from '../../intersectSchema';

type MergeSchemaHandler = Fn<
  [base: JSONSchema, source: Partial<JSONSchema>],
  JSONSchema
>;

/**
 * Returns the appropriate schema intersection function based on the JSON Schema.
 * Each type has its own specialized merge logic for combining schemas in an allOf array.
 *
 * @param schema - The JSON Schema to get the merge function for
 * @returns The merge function for the given schema type, or null if no merge function exists
 */
export const getMergeSchemaHandler = (
  schema: JSONSchema,
): MergeSchemaHandler | null => {
  const schemaInfo = extractSchemaInfo(schema);
  switch (schemaInfo?.type) {
    case 'array':
      return intersectArraySchema as MergeSchemaHandler;
    case 'boolean':
      return intersectBooleanSchema as MergeSchemaHandler;
    case 'null':
      return intersectNullSchema as MergeSchemaHandler;
    case 'number':
    case 'integer':
      return intersectNumberSchema as MergeSchemaHandler;
    case 'object':
      return intersectObjectSchema as MergeSchemaHandler;
    case 'string':
      return intersectStringSchema as MergeSchemaHandler;
  }
  return null;
};
