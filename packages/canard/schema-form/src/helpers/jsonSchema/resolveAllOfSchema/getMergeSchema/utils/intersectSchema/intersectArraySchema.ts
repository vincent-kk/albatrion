import type { JsonSchemaWithVirtual } from '@/schema-form/types';

export const intersectArraySchema = (
  base: JsonSchemaWithVirtual,
  source: Partial<JsonSchemaWithVirtual>,
) => {
  return base;
};
