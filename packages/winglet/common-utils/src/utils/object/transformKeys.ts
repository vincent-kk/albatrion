/**
 * Creates a new object by transforming all keys of an object.
 * Preserves the values of the object while only transforming the keys.
 *
 * @template Type - Input object type
 * @template Key - Transformed key type
 * @param object - Object to transform
 * @param getKey - Function to transform each key
 * @returns New object with transformed keys
 *
 * @example
 * transformKeys({a: 1, b: 2}, (_, key) => key + '_new'); // {a_new: 1, b_new: 2}
 * transformKeys({a: 1, b: 2}, (_, key) => key.toUpperCase()); // {A: 1, B: 2}
 */
export const transformKeys = <
  Type extends Record<PropertyKey, any>,
  Key extends PropertyKey,
>(
  object: Type,
  getKey: (value: Type[keyof Type], key: keyof Type, object: Type) => Key,
): Record<Key, Type[keyof Type]> => {
  const result = {} as Record<Key, Type[keyof Type]>;
  const keys = Object.keys(object) as Array<keyof Type>;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = object[key];
    result[getKey(value, key, object)] = value;
  }
  return result;
};
