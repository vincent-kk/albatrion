import { isFunction } from '@/common-utils/utils/filter';

export const intersection = <Type1, Type2>(
  source: readonly Type1[],
  target: readonly Type2[],
  options?: {
    isEqual?: (a: Type1, b: Type2) => boolean;
    mapper?: (item: Type1 | Type2) => unknown;
  },
): Type1[] => {
  if (isFunction(options?.isEqual)) {
    const isEqual = options.isEqual;
    return source.filter((item) =>
      target.some((secondItem) => isEqual(item, secondItem)),
    );
  }
  if (isFunction(options?.mapper)) {
    const mapper = options.mapper;
    const targetSet = new Set(target.map(mapper));
    return source.filter((item) => targetSet.has(mapper(item)));
  }
  const targetSet = new Set(target);
  return source.filter((item) => targetSet.has(item as any));
};
