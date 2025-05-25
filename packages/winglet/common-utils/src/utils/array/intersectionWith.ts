/**
 * Function to return the intersection of two arrays
 * Uses a comparison function to compare elements of each array,
 * and returns an array of elements that form the intersection
 * @template Type1 - Type of the first array elements
 * @template Type2 - Type of the second array elements
 * @param source - First array
 * @param target - Second array
 * @param isEqual - Element comparison function
 * @returns Array of elements that form the intersection of both arrays
 */
export const intersectionWith = <Type1, Type2>(
  source: Type1[],
  target: Type2[],
  isEqual: (source: Type1, target: Type2) => boolean,
): Type1[] => {
  const result: Type1[] = [];
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    for (let j = 0; j < target.length; j++) {
      if (isEqual(item, target[j])) {
        result[result.length] = item;
        break;
      }
    }
  }
  return result;
};
