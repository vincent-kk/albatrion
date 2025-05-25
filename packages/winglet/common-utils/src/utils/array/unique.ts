/**
 * Function to remove duplicate elements from an array
 * Removes duplicate elements and returns only unique elements
 * @template Type - Type of array elements
 * @param source - Source array to remove duplicates from
 * @returns Array with duplicate elements removed
 */
export const unique = <Type>(source: Type[]): Type[] =>
  Array.from(new Set(source));
