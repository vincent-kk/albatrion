/**
 * Function to remove duplicate elements from an array
 * Uses a custom comparison function to determine equality of elements
 * Only the first occurrence among elements considered equal is retained
 * @template Type - Type of array elements
 * @param source - Source array to remove duplicates from
 * @param isEqual - Comparison function to determine if two elements are equal
 * @returns Array with duplicates removed
 */
export const uniqueWith = <Type>(
  source: Type[],
  isEqual: (item1: Type, item2: Type) => boolean,
): Type[] => {
  const result: Type[] = [];
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    let isDuplicate = false;
    for (let j = 0; j < result.length; j++)
      if (isEqual(item, result[j])) {
        isDuplicate = true;
        break;
      }
    if (!isDuplicate) result[result.length] = item;
  }
  return result;
};
