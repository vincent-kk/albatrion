import type { Dictionary, Fn } from '@aileron/declare';

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
      if (!omits.has(key)) filteredKeys.push(key);
    }
    keys = filteredKeys;
  }

  if (sort) keys = keys.sort(sort);

  return keys;
};
