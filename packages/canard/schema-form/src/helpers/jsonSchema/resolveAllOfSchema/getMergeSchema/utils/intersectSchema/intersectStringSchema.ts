import type { StringSchema } from '@/schema-form/types';

export const intersectStringSchema = (
  base: StringSchema,
  source: Partial<StringSchema>,
) => {
  return base;
};
