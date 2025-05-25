import type { Dictionary, Fn } from '@aileron/declare';

/**
 * Returns an array of keys from an object.
 *
 * @template Type - Dictionary type object
 * @param object - Object to extract keys from
 * @param omit - Set or array of keys to exclude (optional)
 * @param sort - Comparison function for sorting keys (optional)
 * @returns Array of object keys
 *
 * @example
 * // Get all keys
 * getObjectKeys({a: 1, b: 2, c: 3}); // ['a', 'b', 'c']
 *
 * // Exclude specific keys
 * getObjectKeys({a: 1, b: 2, c: 3}, ['b']); // ['a', 'c']
 *
 * // Sort keys
 * getObjectKeys({c: 3, a: 1, b: 2}, undefined, (a, b) => a.localeCompare(b)); // ['a', 'b', 'c']
 */
export const getObjectKeys = <Type extends Dictionary>(
  object: Type | undefined,
  omit?: Set<keyof Type> | Array<keyof Type>,
  sort?: Fn<[a: keyof Type, b: keyof Type], number>,
): Array<keyof Type> => {
  if (!object) return [];
  let keys: Array<keyof Type> = Object.keys(object);

  if (omit) {
    const omits = omit instanceof Set ? omit : new Set(omit);
    const filteredKeys: Array<keyof Type> = [];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (!omits.has(key)) filteredKeys[filteredKeys.length] = key;
    }
    keys = filteredKeys;
  }

  if (sort) keys = keys.sort(sort);

  return keys;
};
