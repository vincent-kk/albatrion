export const groupBy = <Type, Key extends PropertyKey>(
  array: readonly Type[],
  getKey: (item: Type) => Key,
): Record<Key, Type[]> => {
  const result = {} as Record<Key, Type[]>;
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    const key = getKey(item);
    if (key in result) result[key].push(item);
    else result[key] = [item];
  }
  return result;
};
