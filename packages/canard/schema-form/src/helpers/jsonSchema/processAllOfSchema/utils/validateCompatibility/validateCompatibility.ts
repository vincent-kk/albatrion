import type { JsonSchema } from '@/schema-form/types';

export const validateCompatibility = (
  schemaType: JsonSchema['type'],
  allOfSchemaType: JsonSchema['type'],
) =>
  allOfSchemaType === undefined ||
  (schemaType === 'number' && allOfSchemaType === 'integer') ||
  (schemaType === 'integer' && allOfSchemaType === 'number') ||
  schemaType === allOfSchemaType;
