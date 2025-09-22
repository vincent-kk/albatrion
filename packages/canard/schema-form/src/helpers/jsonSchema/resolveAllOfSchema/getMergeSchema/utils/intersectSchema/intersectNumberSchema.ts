import type { JsonSchemaWithVirtual } from '@/schema-form/types';

export const intersectNumberSchema = (
  base: JsonSchemaWithVirtual,
  source: Partial<JsonSchemaWithVirtual>,
) => {
  return base;
};
