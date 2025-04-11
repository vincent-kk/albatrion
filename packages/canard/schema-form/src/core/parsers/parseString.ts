export const parseString = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return value.toString();
  return undefined;
};
