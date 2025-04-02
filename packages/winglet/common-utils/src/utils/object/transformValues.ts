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
