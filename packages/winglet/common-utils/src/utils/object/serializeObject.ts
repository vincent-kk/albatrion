import { getObjectKeys } from './getObjectKeys';
import { serializeNative } from './serializeNative';

/**
 * Converts an object to a serialized string.
 *
 * @param object - Object to serialize
 * @param omits - Array of property keys to exclude from serialization (optional)
 * @returns Serialized string (in 'key:value' format separated by '|')
 *
 * @example
 * serializeObject({a: 1, b: 2}); // 'a:1|b:2'
 * serializeObject({a: 1, b: 2, c: 3}, ['b']); // 'a:1|c:3'
 */
export const serializeObject = (object: any, omits?: string[]): string => {
  if (!object || typeof object !== 'object') return serializeNative(object);
  const keys = getObjectKeys(object, omits) as string[];
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
