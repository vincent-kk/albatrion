import { isFunction } from '@/common-utils/utils/filter';

import { map } from './map';

export const difference = <Type1, Type2>(
  source: Type1[],
  exclude: Type2[],
  options?: {
    isEqual?: (source: Type1, exclude: Type2) => boolean;
    mapper?: (item: Type1 | Type2) => unknown;
  },
): Type1[] => {
  if (isFunction(options?.isEqual)) {
    const isEqual = options.isEqual;
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
  }
  if (isFunction(options?.mapper)) {
    const mapper = options.mapper;
    const excludeSet = new Set(map(exclude, mapper));
    const result: Type1[] = [];
    for (let i = 0; i < source.length; i++) {
      const item = source[i];
      const mappedItem = mapper(item);
      if (!excludeSet.has(mappedItem)) result.push(item);
    }
    return result;
  }
  const result: Type1[] = [];
  const excludeSet = new Set(exclude);
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    if (!excludeSet.has(item as any)) result.push(item);
  }
  return result;
};
