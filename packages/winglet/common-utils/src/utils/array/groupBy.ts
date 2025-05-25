/**
 * Function to group array elements by a specified key
 * Applies a key function to each element to determine the grouping key
 * @template Type - Type of array elements
 * @template Key - Type of grouping key (PropertyKey - string, number, symbol)
 * @param array - Array to group
 * @param getKey - Function to extract the grouping key from each element
 * @returns Object containing elements grouped by key
 */
export const groupBy = <Type, Key extends PropertyKey>(
  array: Type[],
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
