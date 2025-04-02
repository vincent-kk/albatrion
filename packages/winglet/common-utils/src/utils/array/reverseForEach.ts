export const reverseForEach = <Type>(
  array: Type[],
  callback: (item: Type, index: number, array: Type[]) => void,
) => {
  for (let i = array.length - 1; i >= 0; i--) callback(array[i], i, array);
};
