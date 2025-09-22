import type { JsonSchemaWithVirtual, NumberSchema } from '@/schema-form/types';

export const intersectNumberSchema = (
  base: NumberSchema,
  source: Partial<NumberSchema>,
) => {
  return base;
};
