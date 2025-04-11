export const difference = <Type>(source: Type[], exclude: Type[]): Type[] => {
  const result: Type[] = [];
  const excludeSet = new Set(exclude);
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    if (!excludeSet.has(item)) result.push(item);
  }
  return result;
};
