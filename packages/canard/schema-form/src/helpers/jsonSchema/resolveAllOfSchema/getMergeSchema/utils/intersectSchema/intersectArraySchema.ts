import type { ArraySchema } from '@/schema-form/types';

import { distributeSchema } from '../distributeSchema';

export const intersectArraySchema = (
  base: ArraySchema,
  source: Partial<ArraySchema>,
) => {
  const { items, ...rest } = source;

  if (items !== undefined) {
    if (base.items === undefined) base.items = items;
    else base.items = distributeSchema(base.items, items);
  }
  return base;
};
