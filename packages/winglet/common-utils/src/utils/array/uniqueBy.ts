export const uniqueBy = <Type, SubType>(
  source: Type[],
  mapper: (item: Type) => SubType,
): Type[] => {
  const map = new Map<SubType, Type>();
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    const key = mapper(item);
    if (!map.has(key)) map.set(key, item);
  }
  return Array.from(map.values());
};
