import type { JsonSchemaWithVirtual } from '@/schema-form/types';

export const intersectStringSchema = (
  base: JsonSchemaWithVirtual,
  source: Partial<JsonSchemaWithVirtual>,
) => {
  return base;
};
