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
  const result: ObjectValue = {};
  const keys = Object.keys(value);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (oneOfKeySet.has(key) && !allowedKeySet?.has(key)) continue;
    result[key] = value[key];
  }
  return result;
};
