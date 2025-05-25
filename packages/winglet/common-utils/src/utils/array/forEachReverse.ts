/**
 * Function to iterate over array elements in reverse order and execute a callback function
 * Stops iteration if the callback returns false
 * @template Type - Type of array elements
 * @param array - Array to iterate over in reverse
 * @param callback - Callback function to execute for each element
 */
export const forEachReverse = <Type>(
  array: Type[],
  callback: (item: Type, index: number, array: Type[]) => boolean | void,
) => {
  for (let i = array.length - 1; i >= 0; i--)
    if (callback(array[i], i, array) === false) break;
};
