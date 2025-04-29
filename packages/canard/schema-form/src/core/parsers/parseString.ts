export const parseString = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value.length > 0 ? value : undefined;
  if (typeof value === 'number') return value.toString();
  return undefined;
};
