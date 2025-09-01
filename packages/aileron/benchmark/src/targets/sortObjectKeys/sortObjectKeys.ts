import type { Dictionary, Nullish } from '@aileron/declare';

export const sortObjectKeys = <Dict extends Dictionary>(
  object: Dict | Nullish,
  keys: string[] = [],
): Dict => {
  if (!object) return {} as Dict;
  const keySet = new Set(keys);
  const result: Dictionary = {};
  for (const key of keys) {
    if (key in object) result[key] = object[key];
  }
  for (const key of Object.keys(object)) {
    if (!keySet.has(key)) result[key] = object[key];
  }
  return result as Dict;
};
