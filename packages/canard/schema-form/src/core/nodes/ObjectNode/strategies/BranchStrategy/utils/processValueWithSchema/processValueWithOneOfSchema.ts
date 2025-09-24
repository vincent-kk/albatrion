import type { ObjectValue } from '@/schema-form/types';

/**
 * Removes only properties defined in oneOf from value (keeping only properties keys)
 * Properties not defined anywhere are kept as is
 *
 * @param value Original object value
 * @param schema Object schema definition
 * @returns Object value with oneOf-defined properties removed
 */
export const processValueWithOneOfSchema = (
  value: ObjectValue | undefined,
  oneOfKeySet?: Set<string>,
  allowedKeySet?: Set<string>,
): ObjectValue | undefined => {
  if (value == null || oneOfKeySet === undefined) return value;
  const keys = Object.keys(value);
  if (keys.length === 0) return value;

  const result: ObjectValue = {};
  for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
    if (oneOfKeySet.has(k) && !allowedKeySet?.has(k)) continue;
    result[k] = value[k];
  }
  return result;
};
