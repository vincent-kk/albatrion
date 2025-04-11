export const intersectionWith = <Type1, Type2>(
  source: Type1[],
  target: Type2[],
  isEqual: (source: Type1, target: Type2) => boolean,
): Type1[] => {
  const result: Type1[] = [];
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    for (let j = 0; j < target.length; j++) {
      if (isEqual(item, target[j])) {
        result.push(item);
        break;
      }
    }
  }
  return result;
};
