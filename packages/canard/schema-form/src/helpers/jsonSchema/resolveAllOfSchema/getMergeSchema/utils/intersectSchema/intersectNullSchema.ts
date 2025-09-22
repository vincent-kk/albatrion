import type { JsonSchemaWithVirtual, NullSchema } from '@/schema-form/types';

export const intersectNullSchema = (
  base: NullSchema,
  source: Partial<NullSchema>,
) => {
  return base;
};
