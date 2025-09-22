import type { JsonSchemaWithVirtual } from '@/schema-form/types';

export const intersectNullSchema = (
  base: JsonSchemaWithVirtual,
  source: Partial<JsonSchemaWithVirtual>,
) => {
  return base;
};
