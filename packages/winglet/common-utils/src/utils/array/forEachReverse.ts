export const forEachReverse = <Type>(
  array: Type[],
  callback: (item: Type, index: number, array: Type[]) => boolean | void,
) => {
  for (let i = array.length - 1; i >= 0; i--) {
    if (callback(array[i], i, array) === false) break;
  }
};
