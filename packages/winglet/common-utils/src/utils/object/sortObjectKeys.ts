import type { Dictionary, Nullish } from '@aileron/declare';

export const sortObjectKeys = <Dict extends Dictionary>(
  object: Nullish<Dict>,
  keys: string[] = [],
): Dict => {
  if (!object) return {} as Dict;
  const result: Dictionary = {};
  const inputKeysSet = new Set(keys);
  const objectKeys = Object.keys(object);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key in object) result[key] = object[key];
  }
  for (let i = 0; i < objectKeys.length; i++) {
    const key = objectKeys[i];
    if (!inputKeysSet.has(key)) result[key] = object[key];
  }
  return result as Dict;
};
