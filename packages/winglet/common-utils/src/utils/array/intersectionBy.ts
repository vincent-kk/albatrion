import { map } from './map';

/**
 * Function to return the intersection of two arrays
 * Uses a mapping function to compare elements of each array,
 * and returns an array of elements that form the intersection
 * @template Type1 - Type of the first array elements
 * @template Type2 - Type of the second array elements
 * @param source - First array
 * @param target - Second array
 * @param mapper - Function to transform elements into comparable values
 * @returns Array of elements that form the intersection of both arrays
 */
export const intersectionBy = <Type1, Type2>(
  source: Type1[],
  target: Type2[],
  mapper: (item: Type1 | Type2) => unknown,
): Type1[] => {
  const targetSet = new Set(map(target, mapper));
  const result: Type1[] = [];
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    if (targetSet.has(mapper(item))) result[result.length] = item;
  }
  return result;
};
