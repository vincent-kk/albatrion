import { isArray } from '@/common-utils/utils/filter/isArray';
import { isPlainObject } from '@/common-utils/utils/filter/isPlainObject';

import { setDataProperty } from '../../setDataProperty';

/**
 * Copies exactly one supported container level without visiting its child values.
 * @param value - Root value whose children remain caller-owned references
 * @returns A copied array/plain object, or the original unsupported value
 */
export function replicateShallow<Type>(value: Type): Type;
export function replicateShallow(value: unknown): unknown {
  if (isArray(value)) {
    const output: unknown[] = new Array(value.length);
    for (let index = 0; index < value.length; index++)
      if (index in value) output[index] = value[index];
    return output;
  }
  if (isPlainObject(value)) {
    const prototype = Object.getPrototypeOf(value);
    const output: Record<string, unknown> =
      prototype === Object.prototype ? {} : Object.create(prototype);
    for (const key of Object.keys(value)) {
      if (key === '__proto__') setDataProperty(output, key, value[key]);
      else output[key] = value[key];
    }
    return output;
  }
  return value;
}
