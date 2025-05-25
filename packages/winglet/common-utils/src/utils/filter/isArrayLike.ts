/**
 * Function to check if a value has an array-like structure
 * Checks if it's an object that behaves like an array (has length and is accessible by index)
 * @param value - Value to check
 * @returns true if the value has an array-like structure, false otherwise
 */
export const isArrayLike = (value: unknown): value is ArrayLike<unknown> =>
  value !== null &&
  typeof value === 'object' &&
  'length' in value &&
  typeof value.length === 'number' &&
  (value.length === 0 || value.length - 1 in value);
