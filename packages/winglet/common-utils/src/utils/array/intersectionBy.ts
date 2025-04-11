import { map } from './map';

export const intersectionBy = <Type1, Type2>(
  source: Type1[],
  target: Type2[],
  mapper: (item: Type1 | Type2) => unknown,
): Type1[] => {
  const targetSet = new Set(map(target, mapper));
  const result: Type1[] = [];
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    if (targetSet.has(mapper(item))) result.push(item);
  }
  return result;
};
