import type { BooleanSchema, UnknownSchema } from '../types/jsonSchema';

/**
 * Checks if a schema is a boolean type.
 * @param schema The JSON schema to check
 * @returns Whether the schema is a boolean schema
 */
export const isBooleanSchema = (
  schema: UnknownSchema,
): schema is BooleanSchema => schema.type === 'boolean';
