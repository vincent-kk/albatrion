/**
 * Function to check if a value is a number
 * @param value - Value to check
 * @returns true if the value is a number, false otherwise
 */
export const isNumber = (value?: unknown): value is number =>
  typeof value === 'number';
