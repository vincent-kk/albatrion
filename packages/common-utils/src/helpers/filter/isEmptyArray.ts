export const isEmptyArray = (value: unknown): value is any[] =>
  Array.isArray(value) && value.length === 0;
