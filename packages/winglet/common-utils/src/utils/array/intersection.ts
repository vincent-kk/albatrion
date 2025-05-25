/**
 * Function to find the intersection of two arrays
 * Returns elements from the first array that also exist in the second array
 * @template Type - Type of array elements
 * @param source - Source array to use as base
 * @param target - Target array to compare against
 * @returns Array of elements that exist in both arrays
 */
export const intersection = <Type>(source: Type[], target: Type[]): Type[] => {
  const result: Type[] = [];
  const targetSet = new Set(target);
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    if (targetSet.has(item)) result[result.length] = item;
  }
  return result;
};
