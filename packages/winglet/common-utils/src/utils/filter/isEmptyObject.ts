import { isObject } from './isObject';

/**
 * Function to check if a value is an empty object
 * Considers an object empty if it has no properties
 * @param value - Value to check
 * @returns true if the value is an empty object, false otherwise
 */
export const isEmptyObject = (value: unknown): value is object => {
  if (!isObject(value)) return false;
  for (const _ in value) return false;
  return true;
};
