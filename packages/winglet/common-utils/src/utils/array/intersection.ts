import { isFunction } from '@/common-utils/utils/filter';

import { map } from './map';

export const intersection = <Type1, Type2>(
  source: Type1[],
  target: Type2[],
  options?: {
    isEqual?: (source: Type1, target: Type2) => boolean;
    mapper?: (item: Type1 | Type2) => unknown;
  },
): Type1[] => {
  if (isFunction(options?.isEqual)) {
    const isEqual = options.isEqual;
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
  }

  if (isFunction(options?.mapper)) {
    const mapper = options.mapper;
    const targetSet = new Set(map(target, mapper));
    const result: Type1[] = [];
    for (let i = 0; i < source.length; i++) {
      const item = source[i];
      if (targetSet.has(mapper(item))) result.push(item);
    }
    return result;
  }

  const result: Type1[] = [];
  const targetSet = new Set(target);
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    if (targetSet.has(item as any)) result.push(item);
  }
  return result;
};
