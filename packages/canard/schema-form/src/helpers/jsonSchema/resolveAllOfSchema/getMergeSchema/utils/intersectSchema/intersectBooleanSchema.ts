import type { BooleanSchema, JsonSchemaWithVirtual } from '@/schema-form/types';

export const intersectBooleanSchema = (
  base: BooleanSchema,
  source: Partial<BooleanSchema>,
) => {
  return base;
};
