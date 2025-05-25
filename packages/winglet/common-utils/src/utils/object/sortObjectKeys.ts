import type { Dictionary, Nullish } from '@aileron/declare';

/**
 * Sorts an object's keys in the specified order.
 *
 * @template Dict - Dictionary type
 * @param object - Object to sort
 * @param keys - Array of keys specifying the sort order
 * @param omitUndefined - Whether to exclude properties with undefined values (optional)
 * @returns New object with sorted keys
 *
 * @example
 * sortObjectKeys({c: 3, a: 1, b: 2}, ['a', 'b', 'c']); // {a: 1, b: 2, c: 3}
 * sortObjectKeys({c: 3, a: 1, b: undefined}, ['a', 'b', 'c'], true); // {a: 1, c: 3}
 */
export const sortObjectKeys = <Dict extends Dictionary>(
  object: Nullish<Dict>,
  keys: string[],
  omitUndefined?: boolean,
): Dict => {
  if (!object) return {} as Dict;
  const result: Dictionary = {};
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    if (!(key in object) || (omitUndefined && object[key] === undefined))
      continue;
    result[key] = object[key];
  }
  const objectKeys = Object.keys(object);
  for (let index = 0; index < objectKeys.length; index++) {
    const key = objectKeys[index];
    if (key in result || (omitUndefined && object[key] === undefined)) continue;
    result[key] = object[key];
  }
  return result as Dict;
};
