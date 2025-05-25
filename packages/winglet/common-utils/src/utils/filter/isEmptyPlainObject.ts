import { isPlainObject } from './isPlainObject';

/**
 * Function to check if a value is an empty plain object
 * Considers it an empty plain object if it's a plain object with no properties
 * @param value - Value to check
 * @returns true if the value is an empty plain object, false otherwise
 */
export const isEmptyPlainObject = (value: unknown): value is object => {
  if (!isPlainObject(value)) return false;
  for (const _ in value) return false;
  return true;
};
