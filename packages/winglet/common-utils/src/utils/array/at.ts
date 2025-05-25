/**
 * Function to get element(s) at given index(es) from an array
 * Negative indices are calculated in reverse order from the end of the array (-1 is the last element)
 * @template Type - Type of array elements
 * @template Indexes - Index or array of indices to retrieve
 * @template Result - Return result type (Type for single index, Type[] for array indices)
 * @param array - Target array
 * @param indexes - Index or array of indices of elements to retrieve
 * @returns Array element(s) at the given index(es)
 */
export const at = <
  Type,
  Indexes extends number[] | number,
  Result = Indexes extends number[] ? Type[] : Type,
>(
  array: readonly Type[],
  indexes: Indexes,
): Result => {
  if (typeof indexes === 'number') {
    const index = indexes < 0 ? indexes + array.length : indexes;
    return array[index] as unknown as Result;
  }
  const result = new Array<Type>(indexes.length);
  const length = array.length;
  for (let i = 0; i < indexes.length; i++) {
    let index = indexes[i];
    index = Number.isInteger(index) ? index : Math.trunc(index) || 0;
    if (index < 0) index += length;
    result[i] = array[index];
  }
  return result as Result;
};
