/**
 * Function to check if a value is an integer
 * Type-extended alias for Number.isInteger
 * @param value - Value to check
 * @returns true if the value is an integer, false otherwise
 */
export const isInteger = Number.isInteger as (
  value?: unknown,
) => value is number;
