/**
 * Function to check if a value is an object
 * @param value - Value to check
 * @returns true if the value is an object, false otherwise
 */
export const isObject = (value?: unknown): value is object =>
  value !== null && typeof value === 'object';
