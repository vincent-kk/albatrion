/**
 * Function to check if a value is not null or undefined
 * @param value - Value to check
 * @returns true if the value is not null or undefined, false otherwise
 */
export const isNotNil = <T>(value: T | null | undefined): value is T =>
  value != null;
