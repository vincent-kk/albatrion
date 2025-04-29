import type { Dictionary, Fn } from '@aileron/declare';

export const getObjectKeys = <Type extends Dictionary>(
  object: Type,
  omit?: Array<keyof Type>,
  sort?: Fn<[a: string, b: string], number>,
): Array<keyof Type> => {
  const omits = omit ? new Set(omit) : null;
  const sortedKeys = Object.keys(object).sort(sort);
  if (!omits) return sortedKeys as Array<keyof Type>;
  const keys: Array<keyof Type> = [];
  for (let i = 0; i < sortedKeys.length; i++) {
    const key = sortedKeys[i];
    if (!omits.has(key)) keys.push(key);
  }
  return keys;
};
