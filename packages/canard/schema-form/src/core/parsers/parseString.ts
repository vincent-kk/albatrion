/**
 * Parses input value to string format.
 * @param value - Value to parse
 * @returns Parsed string value or undefined if empty string or invalid
 */
export const parseString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return '' + value;
  return '';
};
