import type { JsonSchema } from '@/schema-form/types';

/**
 * Validates whether a schema type is compatible with an allOf schema type.
 * Types are compatible if the allOf type is undefined, if they match exactly,
 * or if they are number/integer combinations (which are cross-compatible).
 *
 * @param schemaType - The main schema type
 * @param allOfSchemaType - The type from the allOf schema to validate
 * @returns True if the types are compatible, false otherwise
 */
export const validateCompatibility = (
  schemaType: JsonSchema['type'],
  allOfSchemaType: JsonSchema['type'],
) =>
  allOfSchemaType === undefined ||
  (schemaType === 'number' && allOfSchemaType === 'integer') ||
  (schemaType === 'integer' && allOfSchemaType === 'number') ||
  schemaType === allOfSchemaType;
