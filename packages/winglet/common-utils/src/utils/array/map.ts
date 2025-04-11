export const map = <Type, Result = Type>(
  array: Type[],
  callback: (item: Type, index: number, array: Type[]) => Result,
): Result[] => {
  const result = new Array<Result>(array.length);
  for (let i = 0; i < array.length; i++)
    result[i] = callback(array[i], i, array);
  return result;
};
