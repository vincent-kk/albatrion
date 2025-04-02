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
