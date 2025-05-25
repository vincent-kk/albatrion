/**
 * Function to check if a value is a string
 * @param value - Value to check
 * @returns true if the value is a string, false otherwise
 */
export const isString = (value?: unknown): value is string =>
  typeof value === 'string';
