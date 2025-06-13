import type { NullSchema, UnknownSchema } from '../types/jsonSchema';

/**
 * Checks if a schema is a null type.
 * @param schema The JSON schema to check
 * @returns Whether the schema is a null schema
 */
export const isNullSchema = (schema: UnknownSchema): schema is NullSchema =>
  schema.type === 'null';
