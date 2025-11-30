import { isCompatibleSchemaType } from '@winglet/json-schema/filter';

import type { JsonSchema } from '@/schema-form/types';

/**
 * Validates type compatibility between two schemas during allOf schema merging.
 *
 * Compatibility rules:
 * 1. Compatible if allOf schema has no type (only adds constraints)
 * 2. Compatible if both schema types match exactly (using isCompatibleSchemaType)
 *
 * Important notes:
 * - number and integer are treated as different types and are incompatible
 * - Nullable types (['string', 'null']) and non-nullable types ('string') are incompatible
 * - Order of nullable type arrays is ignored (['string', 'null'] equals ['null', 'string'])
 *
 * @param schema - The base schema
 * @param allOfSchema - The allOf schema to merge
 * @returns True if types are compatible, false otherwise
 */
export const validateCompatibility = (
  schema: JsonSchema,
  allOfSchema: JsonSchema,
) =>
  allOfSchema.type === undefined || isCompatibleSchemaType(schema, allOfSchema);
