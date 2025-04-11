import { map } from './map';

export const differenceBy = <Type1, Type2>(
  source: Type1[],
  exclude: Type2[],
  mapper: (item: Type1 | Type2) => unknown,
): Type1[] => {
  const excludeSet = new Set(map(exclude, mapper));
  const result: Type1[] = [];
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    const mappedItem = mapper(item);
    if (!excludeSet.has(mappedItem)) result.push(item);
  }
  return result;
};
