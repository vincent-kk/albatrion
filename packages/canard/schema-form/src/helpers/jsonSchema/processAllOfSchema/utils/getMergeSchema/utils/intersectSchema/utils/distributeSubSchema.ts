import { isArray } from '@winglet/common-utils/filter';

import type { JsonSchema } from '@/schema-form/types';
import type { ArraySchema } from '@/schema-form/types';
import type { ObjectSchema } from '@/schema-form/types';

export const distributeAllOfProperties = (
  base: ObjectSchema,
  source: Partial<ObjectSchema>,
) => {
  if (source.properties === undefined) return;
  if (base.properties === undefined) base.properties = source.properties;
  else {
    const properties = base.properties;
    const keys = Object.keys(source.properties);
    for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
      const subSchema = source.properties[k];
      if (properties[k] === undefined) properties[k] = subSchema;
      else distributeSchema(properties[k], subSchema);
    }
  }
};

export const distributeAllOfItems = (
  base: ArraySchema,
  source: Partial<ArraySchema>,
) => {
  if (source.items === undefined) return;
  if (base.items === undefined) base.items = source.items;
  else distributeSchema(base.items, source.items);
};

const distributeSchema = <Schema extends JsonSchema>(
  base: Schema,
  source: Partial<JsonSchema>,
) => {
  if (isArray(base.allOf)) base.allOf.push(source);
  else base.allOf = [source];
};
