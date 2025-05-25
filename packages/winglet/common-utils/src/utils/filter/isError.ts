/**
 * Function to check if a value is an Error object
 * @param value - Value to check
 * @returns true if the value is an Error object, false otherwise
 */
export const isError = (value: unknown): value is Error =>
  value instanceof Error;
