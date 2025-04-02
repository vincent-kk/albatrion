import { isFunction } from '@/common-utils/utils/filter';

export const difference = <Type1, Type2>(
  source: readonly Type1[],
  exclude: readonly Type2[],
  options?: {
    isEqual?: (a: Type1, b: Type2) => boolean;
    mapper?: (item: Type1 | Type2) => unknown;
  },
): Type1[] => {
  if (isFunction(options?.isEqual)) {
    const isEqual = options.isEqual;
    return source.filter(
      (item) => !exclude.some((secondItem) => isEqual(item, secondItem)),
    );
  }
  if (isFunction(options?.mapper)) {
    const mapper = options.mapper;
    const excludeSet = new Set(exclude.map(mapper));
    return source.filter((item) => !excludeSet.has(mapper(item)));
  }
  const excludeSet = new Set(exclude);
  return source.filter((item) => !excludeSet.has(item as any));
};
