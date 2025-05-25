/**
 * Creates a new object by transforming all values of an object.
 * Preserves the object structure while only transforming the values.
 *
 * @template Type - Input object type
 * @template Key - Object key type
 * @template Value - Transformed value type
 * @param object - Object to transform
 * @param getValue - Function to transform each value
 * @returns New object with transformed values
 *
 * @example
 * transformValues({a: 1, b: 2}, (value) => value * 2); // {a: 2, b: 4}
 * transformValues({a: 'hello', b: 'world'}, (value) => value.toUpperCase()); // {a: 'HELLO', b: 'WORLD'}
 */
export const transformValues = <
  Type extends object,
  Key extends keyof Type,
  Value,
>(
  object: Type,
  getValue: (value: Type[Key], key: Key, object: Type) => Value,
): Record<Key, Value> => {
  const result = {} as Record<Key, Value>;
  const keys = Object.keys(object);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i] as Key;
    const value = object[key];
    result[key] = getValue(value, key, object);
  }
  return result;
};
