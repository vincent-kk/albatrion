import type { Fn } from '@aileron/declare';

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
 * Returns the appropriate schema intersection function based on the JSON Schema type.
 * Each type has its own specialized merge logic for combining schemas in an allOf array.
 *
 * @param type - The JSON Schema type to get the merge function for
 * @returns The merge function for the given type, or null if no merge function exists
 */
export const getMergeSchema = (
  type: JsonSchema['type'],
): MergeSchema | null => {
  switch (type) {
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
