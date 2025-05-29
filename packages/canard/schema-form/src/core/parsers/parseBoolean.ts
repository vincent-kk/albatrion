/**
 * Parses input value to boolean format.
 * @param value - Value to parse
 * @returns Parsed boolean value or undefined if value is undefined
 */
export const parseBoolean = (value: unknown): boolean => {
  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();
    if (normalizedValue === 'true') return true;
    if (normalizedValue === 'false') return false;
  }
  return !!value;
};
