import type { Dictionary, Fn } from '@aileron/declare';

export const serializeObject = (object: any, omits?: string[]): string => {
  if (!object || typeof object !== 'object') return JSON.stringify(object);
  const keys = getObjectKeys(object, omits) as string[];
  const segments = new Array(keys.length);
  let key = keys.pop();
  let index = 0;
  while (key) {
    segments[index++] =
      `${key}:${typeof object[key] === 'object' ? JSON.stringify(object[key]) : object[key]}`;
    key = keys.pop();
  }
  return segments.join('|');
};

const getObjectKeys = <Type extends Dictionary>(
  object: Type,
  omitKeys?: Array<keyof Type>,
  sort?: Fn<[a: string, b: string], number>,
): Array<keyof Type> => {
  const omit = omitKeys ? new Set(omitKeys) : null;
  const sortedKeys = Object.keys(object).sort(sort);
  if (!omit) return sortedKeys as Array<keyof Type>;
  const keys: Array<keyof Type> = [];
  for (let i = 0; i < sortedKeys.length; i++) {
    const key = sortedKeys[i];
    if (!omit.has(key)) keys.push(key);
  }
  return keys;
};
