/**
 * Function to apply a callback function to each element of an array
 * Stops iteration if the callback returns false
 * @template Type - Type of array elements
 * @param array - Array to iterate over
 * @param callback - Callback function to apply to each element. Stops iteration if returns false
 */
export const forEach = <Type>(
  array: Type[],
  callback: (item: Type, index: number, array: Type[]) => boolean | void,
) => {
  for (let index = 0; index < array.length; index++)
    if (callback(array[index], index, array) === false) break;
};
