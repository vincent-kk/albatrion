export const intersection = <Type>(source: Type[], target: Type[]): Type[] => {
  const result: Type[] = [];
  const targetSet = new Set(target);
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    if (targetSet.has(item)) result.push(item);
  }
  return result;
};
