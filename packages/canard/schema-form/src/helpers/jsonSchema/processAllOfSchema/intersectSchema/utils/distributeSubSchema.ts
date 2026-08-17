import { isArray } from '@winglet/common-utils/filter';

import type { JsonSchema } from '@/schema-form/types';
import type { ArraySchema } from '@/schema-form/types';
import type { ObjectSchema } from '@/schema-form/types';

/**
 * Distributes object properties from source into base schema using allOf composition.
 *
 * This function merges object properties by either directly assigning them to the base
 * schema or distributing them through allOf composition when properties already exist.
 * This enables proper schema merging for complex object intersection scenarios.
 *
 * @param base - The base object schema to modify
 * @param source - The source object schema containing properties to distribute
 */
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

/**
 * Distributes array items from source into base schema using allOf composition.
 *
 * In allOf (AND) logic:
 * - `items: false` means "no items allowed" (only empty array is valid)
 * - If either side is `false`, the result must be `false` (most restrictive wins)
 * - `undefined` means "no constraint" and defers to the other schema
 *
 * @param base - The base array schema to modify
 * @param source - The source array schema containing items to distribute
 */
export const distributeAllOfItems = (
  base: ArraySchema,
  source: Partial<ArraySchema>,
) => {
  if (base.items === false || source.items === undefined) return;
  else if (source.items === false) base.items = false;
  else if (base.items === undefined) base.items = source.items;
  else distributeSchema(base.items, source.items);
};

const distributeSchema = <Schema extends JsonSchema>(
  base: Schema,
  source: Partial<JsonSchema>,
) => {
  if (isArray(base.allOf)) base.allOf.push(source);
  else base.allOf = [source];
};
