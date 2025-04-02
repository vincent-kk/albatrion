export const forEachDual = <Type1, Type2>(
  array1: Type1[],
  array2: Type2[],
  callback: (
    item1: Type1 | undefined,
    item2: Type2 | undefined,
    index: number,
    array1: Type1[],
    array2: Type2[],
  ) => void,
) => {
  const array1Length = array1.length;
  const array2Length = array2.length;
  const length = Math.max(array1Length, array2Length);
  for (let i = 0; i < length; i++) {
    const item1 = i < array1Length ? array1[i] : undefined;
    const item2 = i < array2Length ? array2[i] : undefined;
    callback(item1, item2, i, array1, array2);
  }
};
