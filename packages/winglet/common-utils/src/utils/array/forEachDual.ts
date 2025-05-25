/**
 * Function to iterate over two arrays simultaneously and execute a callback function
 * When arrays have different lengths, iterates based on the longer array's length,
 * passing undefined for indices that exceed the shorter array's range
 * Stops iteration if the callback returns false
 * @template Type1 - Type of the first array elements
 * @template Type2 - Type of the second array elements
 * @param array1 - First array to iterate over
 * @param array2 - Second array to iterate over
 * @param callback - Callback function to execute for each element pair
 */
export const forEachDual = <Type1, Type2>(
  array1: Type1[],
  array2: Type2[],
  callback: (
    item1: Type1 | undefined,
    item2: Type2 | undefined,
    index: number,
    array1: Type1[],
    array2: Type2[],
  ) => boolean | void,
) => {
  const array1Length = array1.length;
  const array2Length = array2.length;
  const length = Math.max(array1Length, array2Length);
  for (let i = 0; i < length; i++) {
    const item1 = i < array1Length ? array1[i] : undefined;
    const item2 = i < array2Length ? array2[i] : undefined;
    if (callback(item1, item2, i, array1, array2) === false) break;
  }
};
