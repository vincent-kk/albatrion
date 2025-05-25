/**
 * Function to check if a value is a boolean type
 * @param value - Value to check
 * @returns true if the value is a boolean, false otherwise
 */
export const isBoolean = (value?: unknown): value is boolean =>
  typeof value === 'boolean';
