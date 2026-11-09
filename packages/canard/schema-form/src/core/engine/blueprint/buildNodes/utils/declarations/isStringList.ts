import { isArray } from '@winglet/common-utils/filter';

/**
 * Check every position of a declared string list, including sparse positions.
 * @param value - Unvalidated authoring value
 * @returns Whether the value is an array containing only strings
 */
export const isStringList = (value: unknown): value is readonly string[] => {
  if (!isArray(value)) return false;
  for (let index = 0; index < value.length; index++)
    if (typeof value[index] !== 'string') return false;
  return true;
};
