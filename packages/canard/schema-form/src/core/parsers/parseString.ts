/**
 * Parses input value to string format.
 * @param value - Value to parse
 * @returns Parsed string value or undefined if empty string or invalid
 */
export const parseString = (value: unknown): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  return '';
};
