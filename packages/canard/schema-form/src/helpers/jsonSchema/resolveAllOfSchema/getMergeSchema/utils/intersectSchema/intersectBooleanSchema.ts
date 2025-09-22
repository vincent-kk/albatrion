import type { JsonSchemaWithVirtual } from '@/schema-form/types';

export const intersectBooleanSchema = (
  base: JsonSchemaWithVirtual,
  source: Partial<JsonSchemaWithVirtual>,
) => {
  return base;
};
