import type { Dictionary, Nullish } from '@aileron/declare';

export const sortObjectKeys = <Dict extends Dictionary>(
  object: Dict | Nullish,
  keys: string[] = [],
): Dict => {
  if (!object) return {} as Dict;
  const newObj: Dictionary = {};
  const mergedKeys = [...keys, ...Object.keys(object || {})].filter(
    (e, i, arr) => arr.indexOf(e) === i,
  );
  mergedKeys.forEach((key) => {
    if (key in object) {
      newObj[key] = object[key];
    }
  });
  return newObj as Dict;
};
