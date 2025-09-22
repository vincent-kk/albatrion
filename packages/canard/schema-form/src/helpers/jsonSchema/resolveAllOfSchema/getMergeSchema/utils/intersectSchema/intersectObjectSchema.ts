import type { ObjectSchema } from '@/schema-form/types';

import { distributeSchema } from '../distributeSchema';

export const intersectObjectSchema = (
  base: ObjectSchema,
  source: Partial<ObjectSchema>,
) => {
  const { properties, ...rest } = source;

  if (properties !== undefined) {
    if (base.properties === undefined) base.properties = properties;
    else {
      const entries = Object.entries(properties);
      for (let i = 0, l = entries.length; i < l; i++) {
        const [key, value] = entries[i];
        if (base.properties[key] === undefined) base.properties[key] = value;
        else
          base.properties[key] = distributeSchema(base.properties[key], value);
      }
    }
  }
  return base;
};
