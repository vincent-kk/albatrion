/**
 * Function to check if a value is null or undefined
 * @param value - Value to check
 * @returns true if the value is null or undefined, false otherwise
 */
export const isNil = (value?: unknown): value is null | undefined =>
  value == null;
