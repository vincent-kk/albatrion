import { isArray, isPlainObject } from '@winglet/common-utils';

/**
 * @description Nil value or empty object or empty array is invalid object like
 * @param value - value to check
 * @returns - true if value is invalid object like, false otherwise
 */
export const isInvalidValue = (value: unknown): boolean => {
  if (!value) return true;
  else if (isPlainObject(value)) {
    for (const _ in value) return false;
    return true;
  } else if (isArray(value)) return value.length === 0;
  return false;
};
