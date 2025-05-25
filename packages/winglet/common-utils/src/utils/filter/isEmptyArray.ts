import { isArray } from './isArray';

/**
 * Function to check if a value is an empty array
 * @param value - Value to check
 * @returns true if the value is an empty array, false otherwise
 */
export const isEmptyArray = (value: unknown): value is any[] =>
  isArray(value) && value.length === 0;
