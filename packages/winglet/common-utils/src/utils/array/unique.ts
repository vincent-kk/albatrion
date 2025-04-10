import { isFunction } from '@/common-utils/utils/filter';

export const unique = <Type, SubType>(
  source: Type[],
  options?: {
    isEqual?: (item1: Type, item2: Type) => boolean;
    mapper?: (item: Type) => SubType;
  },
): Type[] => {
  if (isFunction(options?.isEqual)) {
    const isEqual = options.isEqual;
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
  }
  if (isFunction(options?.mapper)) {
    const mapper = options.mapper;
    const map = new Map<SubType, Type>();
    for (let i = 0; i < source.length; i++) {
      const item = source[i];
      const key = mapper(item);
      if (!map.has(key)) map.set(key, item);
    }
    return Array.from(map.values());
  }
  return Array.from(new Set(source));
};
