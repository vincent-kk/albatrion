/**
 * Function to remove duplicate elements from an array
 * Determines duplicates by extracting comparison values through a transformation function
 * Only the first occurrence among elements with the same comparison value is retained
 * @template Type - Type of array elements
 * @template SubType - Type of comparison value
 * @param source - Source array to remove duplicates from
 * @param mapper - Function to extract comparison value from elements
 * @returns Array with duplicates removed
 */
export const uniqueBy = <Type, SubType>(
  source: Type[],
  mapper: (item: Type) => SubType,
): Type[] => {
  const map = new Map<SubType, Type>();
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    const key = mapper(item);
    if (!map.has(key)) map.set(key, item);
  }
  return Array.from(map.values());
};
