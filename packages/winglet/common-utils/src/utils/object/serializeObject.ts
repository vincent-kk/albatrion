import { getObjectKeys } from './getObjectKeys';
import { serializeNative } from './serializeNative';

export const serializeObject = (object: any, emits?: string[]): string => {
  if (!object || typeof object !== 'object') return serializeNative(object);
  const keys = getObjectKeys(object, emits) as string[];
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
