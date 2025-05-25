/**
 * Function to check if a value is undefined
 * @param value - Value to check
 * @returns true if the value is undefined, false otherwise
 */
export const isUndefined = (value?: unknown): value is undefined =>
  value === undefined;
