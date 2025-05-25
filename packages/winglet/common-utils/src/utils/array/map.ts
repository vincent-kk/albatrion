/**
 * Function to create a new array by applying a callback function to each element of an array
 * @template Type - Type of input array elements
 * @template Result - Type of result array elements
 * @param array - Source array to transform
 * @param callback - Transformation function to apply to each element
 * @returns New transformed array
 */
export const map = <Type, Result = Type>(
  array: Type[],
  callback: (item: Type, index: number, array: Type[]) => Result,
): Result[] => {
  const result = new Array<Result>(array.length);
  for (let index = 0; index < array.length; index++)
    result[index] = callback(array[index], index, array);
  return result;
};
