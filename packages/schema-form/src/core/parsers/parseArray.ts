export const parseArray = <T>(value: unknown): T[] =>
  Array.isArray(value) ? value : [];
