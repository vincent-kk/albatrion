export const unique = <Type>(source: Type[]): Type[] =>
  Array.from(new Set(source));
