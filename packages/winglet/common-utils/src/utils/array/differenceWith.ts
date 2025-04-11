export const differenceWith = <Type1, Type2>(
  source: Type1[],
  exclude: Type2[],
  isEqual: (source: Type1, exclude: Type2) => boolean,
): Type1[] => {
  const result: Type1[] = [];
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    let isFound = false;
    for (let j = 0; j < exclude.length; j++)
      if (isEqual(item, exclude[j])) {
        isFound = true;
        break;
      }
    if (!isFound) result.push(item);
  }
  return result;
};
