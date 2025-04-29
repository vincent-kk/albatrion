import type { Dictionary, Nullish } from '@aileron/declare';

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
