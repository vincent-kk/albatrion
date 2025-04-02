import { isFunction } from '@/common-utils/utils/filter';

export const unique = <Type, SubType>(
  source: readonly Type[],
  options?: {
    isEqual?: (a: Type, b: Type) => boolean;
    mapper?: (item: Type) => SubType;
  },
): Type[] => {
  if (isFunction(options?.isEqual)) {
    const isEqual = options.isEqual;
    const result: Type[] = [];
    for (let i = 0; i < source.length; i++) {
      const item = source[i];
      if (result.every((v) => !isEqual(v, item))) result.push(item);
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
