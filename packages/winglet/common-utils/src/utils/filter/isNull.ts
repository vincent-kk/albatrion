/**
 * Function to check if a value is null
 * @param value - Value to check
 * @returns true if the value is null, false otherwise
 */
export const isNull = (value?: unknown): value is null => value === null;
