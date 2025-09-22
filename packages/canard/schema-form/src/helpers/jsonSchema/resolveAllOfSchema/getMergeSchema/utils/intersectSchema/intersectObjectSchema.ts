import type { JsonSchemaWithVirtual } from '@/schema-form/types';

export const intersectObjectSchema = (
  base: JsonSchemaWithVirtual,
  source: Partial<JsonSchemaWithVirtual>,
) => {
  return base;
};
