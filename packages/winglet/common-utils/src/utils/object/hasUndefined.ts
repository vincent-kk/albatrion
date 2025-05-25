import { getKeys } from '@/common-utils/libs';

/**
 * Deeply checks if a value or its contents contain undefined.
 * Traverses all nested levels of objects and arrays to find undefined values.
 *
 * @param value - Value to check
 * @returns true if the value itself is undefined or contains undefined internally, false otherwise
 *
 * @example
 * hasUndefined(undefined); // true
 * hasUndefined({ a: 1, b: undefined }); // true
 * hasUndefined({ a: 1, b: { c: undefined } }); // true
 * hasUndefined({ a: 1, b: 2 }); // false
 * hasUndefined([1, 2, undefined]); // true
 */
export const hasUndefined = (value: any): boolean => {
  if (value === undefined) return true;

  const stack: any[] = [value];
  while (stack.length > 0) {
    const current = stack.pop();

    if (current === undefined) return true;
    if (current === null || typeof current !== 'object') continue;

    if (Array.isArray(current)) {
      for (let i = 0, len = current.length; i < len; i++)
        stack[stack.length] = current[i];
    } else {
      const keys = getKeys(current);
      for (let i = 0, len = keys.length; i < len; i++)
        stack[stack.length] = current[keys[i]];
    }
  }

  return false;
};
