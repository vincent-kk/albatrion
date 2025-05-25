/**
 * Function to check if a value is a Date object
 * @param value - Value to check
 * @returns true if the value is a Date object, false otherwise
 */
export const isDate = (value: unknown): value is Date => value instanceof Date;
