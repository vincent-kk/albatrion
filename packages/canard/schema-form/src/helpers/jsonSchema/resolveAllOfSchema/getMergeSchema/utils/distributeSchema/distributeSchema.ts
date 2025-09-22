import type { JsonSchemaWithVirtual } from '@/schema-form/types';

export const distributeSchema = (
  base: JsonSchemaWithVirtual,
  source: Partial<JsonSchemaWithVirtual>,
  field: 'items' | 'properties',
) => {
  return base;
};
