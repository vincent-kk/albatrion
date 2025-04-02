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
