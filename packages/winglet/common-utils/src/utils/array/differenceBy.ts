/**
 * Function to compare two arrays and return elements that exist in the first array but not in the second
 * Uses a transformation function to define comparison criteria
 * @template Type1 - Type of the first array elements
 * @template Type2 - Type of the second array elements
 * @param source - Source array that serves as the base
 * @param exclude - Array containing elements to exclude
 * @param mapper - Function to transform array elements into comparable values
 * @returns Array of elements that exist only in the first array
 */
import { map } from './map';

export const differenceBy = <Type1, Type2>(
  source: Type1[],
  exclude: Type2[],
  mapper: (item: Type1 | Type2) => unknown,
): Type1[] => {
  const excludeSet = new Set(map(exclude, mapper));
  const result: Type1[] = [];
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    const mappedItem = mapper(item);
    if (!excludeSet.has(mappedItem)) result[result.length] = item;
  }
  return result;
};
