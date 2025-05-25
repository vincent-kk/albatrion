import { isInteger } from '@/common-utils/utils/filter/isInteger';

/**
 * Function to split an array into chunks of specified size
 * @template Type - Type of array elements
 * @param array - Array to split
 * @param size - Size of each chunk
 * @returns Array of split chunks
 */
export const chunk = <Type>(array: Type[], size: number): Type[][] => {
  if (!isInteger(size) || size < 1) return [array];
  const chunkSize = Math.ceil(array.length / size);
  const result: Type[][] = new Array(chunkSize);
  for (let index = 0; index < chunkSize; index++) {
    const start = index * size;
    const end = start + size;
    result[index] = array.slice(start, end);
  }
  return result;
};
