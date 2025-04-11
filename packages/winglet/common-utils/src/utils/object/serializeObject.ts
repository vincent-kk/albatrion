import { serializeNative } from './serializeNative';

export const serializeObject = (object: any, omitKeys?: string[]): string => {
  if (!object || typeof object !== 'object') return serializeNative(object);
  const omit = omitKeys ? new Set(omitKeys) : null;
  const keys: string[] = [];
  for (const key of Object.keys(object).sort())
    if (!omit?.has(key)) keys.push(key);
  const segments = new Array(keys.length);
  let key = keys.pop();
  let index = 0;
  while (key) {
    segments[index++] =
      `${key}:${typeof object[key] === 'object' ? serializeNative(object[key]) : object[key]}`;
    key = keys.pop();
  }
  return segments.join('|');
};
