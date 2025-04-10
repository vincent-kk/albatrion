export const forEach = <Type>(
  array: Type[],
  callback: (item: Type, index: number, array: Type[]) => boolean | void,
) => {
  for (let i = 0; i < array.length; i++)
    if (callback(array[i], i, array) === false) break;
};
