/**
 * Function to return an array excluding elements that exist in another array
 * Excludes elements from the source array that are present in the exclude array
 * @template Type - Type of array elements
 * @param source - Source array
 * @param exclude - Array containing elements to exclude
 * @returns New array with elements from source array excluding those in exclude array
 */
export const difference = <Type>(source: Type[], exclude: Type[]): Type[] => {
  const result: Type[] = [];
  const excludeSet = new Set(exclude);
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    if (!excludeSet.has(item)) result[result.length] = item;
  }
  return result;
};
