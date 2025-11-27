import { isArraySchema, isObjectSchema } from '@winglet/json-schema/filter';

import type { JsonSchema } from '@/schema-form/types';

/**
 * Determines the cloning depth limit based on the JSON Schema.
 * Object schemas need deeper cloning (depth 3), array schemas need medium depth (depth 2),
 * and primitive types need shallow cloning (depth 1).
 *
 * @param schema - The JSON Schema
 * @returns The cloning depth limit for the given schema
 */
export const getLimit = (schema: JsonSchema) =>
  isObjectSchema(schema) ? 3 : isArraySchema(schema) ? 2 : 1;
