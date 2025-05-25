/**
 * Function to apply a callback function to each element of an array to create a new array
 * @template Type - Type of input array elements
 * @param array - Source array to filter
 * @param callback - Filtering function to apply to each element
 * @returns New filtered array
 */
export const filter = <Type>(
  array: Type[],
  callback: (item: Type, index: number, array: Type[]) => boolean,
): Type[] => {
  const result = new Array<Type>();
  for (let index = 0; index < array.length; index++)
    if (callback(array[index], index, array))
      result[result.length] = array[index];
  return result;
};
