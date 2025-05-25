/**
 * Function to compare two arrays and return elements that exist in the first array but not in the second
 * Uses a custom comparison function to determine equality of elements
 * @template Type1 - Type of the first array elements
 * @template Type2 - Type of the second array elements
 * @param source - Source array that serves as the base
 * @param exclude - Array containing elements to exclude
 * @param isEqual - Comparison function to determine if two elements are equal
 * @returns Array of elements that exist only in the first array
 */
export const differenceWith = <Type1, Type2>(
  source: Type1[],
  exclude: Type2[],
  isEqual: (source: Type1, exclude: Type2) => boolean,
): Type1[] => {
  const result: Type1[] = [];
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    let isFound = false;
    for (let j = 0; j < exclude.length; j++)
      if (isEqual(item, exclude[j])) {
        isFound = true;
        break;
      }
    if (!isFound) result[result.length] = item;
  }
  return result;
};
