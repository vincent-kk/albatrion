import { isArray } from '@/common-utils/utils/filter/isArray';
import { isPlainObject } from '@/common-utils/utils/filter/isPlainObject';

/**
 * Removes properties with undefined values from objects or arrays.
 * Recursively processes nested objects and arrays.
 *
 * @template Type - Type of input value
 * @param input - Object or array to remove undefined values from
 * @returns New object or array with undefined values removed
 *
 * @example
 * removeUndefined({a: 1, b: undefined, c: {d: undefined, e: 2}}); // {a: 1, c: {e: 2}}
 * removeUndefined([1, undefined, 2]); // [1, 2]
 * removeUndefined([1, {a: undefined, b: 2}, 3]); // [1, {b: 2}, 3]
 */
export const removeUndefined = <Type>(input: Type): Type => {
  if (isArray(input)) {
    const result = [] as typeof input;
    for (let i = 0; i < input.length; i++) {
      const item = removeUndefined(input[i]);
      if (item !== undefined) result[result.length] = item;
    }
    return result;
  }
  if (isPlainObject(input)) {
    const result = {} as typeof input;
    const keys = Object.keys(input) as Array<keyof Type>;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = removeUndefined(input[key] as object);
      if (value !== undefined) (result as any)[key] = value;
    }
    return result;
  }
  return input;
};
