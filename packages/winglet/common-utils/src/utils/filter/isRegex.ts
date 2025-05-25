/**
 * Function to check if a value is a regular expression
 * @param value - Value to check
 * @returns true if the value is a regular expression, false otherwise
 */
export const isRegex = (value: unknown): value is RegExp =>
  value instanceof RegExp;
