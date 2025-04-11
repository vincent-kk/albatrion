export const uniqueWith = <Type>(
  source: Type[],
  isEqual: (item1: Type, item2: Type) => boolean,
): Type[] => {
  const result: Type[] = [];
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    let isDuplicate = false;
    for (let j = 0; j < result.length; j++)
      if (isEqual(item, result[j])) {
        isDuplicate = true;
        break;
      }
    if (!isDuplicate) result.push(item);
  }
  return result;
};
