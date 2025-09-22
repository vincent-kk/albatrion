import type { Fn } from '@aileron/declare';

import type { JsonSchema } from '@/schema-form/types';

import {
  intersectArraySchema,
  intersectBooleanSchema,
  intersectNullSchema,
  intersectNumberSchema,
  intersectObjectSchema,
  intersectStringSchema,
} from './utils/intersectSchema';

type MergeSchema = Fn<
  [base: JsonSchema, source: Partial<JsonSchema>],
  JsonSchema
>;

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
