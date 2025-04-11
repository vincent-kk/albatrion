export const parseNumber = (
  value: unknown,
  isInteger: boolean,
): number | undefined => {
  if (typeof value === 'number')
    return isNaN(value) ? undefined : isInteger ? Math.floor(value) : value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^\d-.]/g, ''));
    return isNaN(parsed) ? undefined : isInteger ? Math.floor(parsed) : parsed;
  }
  return undefined;
};
