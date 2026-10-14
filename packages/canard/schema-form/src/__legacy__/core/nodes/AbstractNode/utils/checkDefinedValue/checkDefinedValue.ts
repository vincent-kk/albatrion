import { hasOwnProperty } from '@winglet/common-utils/lib';

/**
 * Checks if a value is defined.
 *
 * @note
 * - Designed for JSON-serializable types: string, number, boolean, null, array, object
 * - For objects, checks if they have any enumerable own properties using for...in loop
 * - Returns false for objects without enumerable own properties (Date, RegExp, Map, Set)
 * - This is intentional for performance - avoids expensive property enumeration methods
 *
 * @example
 * ```typescript
 * checkDefinedValue(undefined); // false
 * checkDefinedValue(null); // true
 * checkDefinedValue({}); // false
 * checkDefinedValue([]); // false
 * checkDefinedValue({ key: 'value' }); // true
 * checkDefinedValue(new Date()); // false (no enumerable own properties)
 * ```
 *
 * @param value - The value to check
 * @returns true if the value is defined, false otherwise
 */
export const checkDefinedValue = (value: any): boolean => {
  if (value === null) return true;
  if (typeof value === 'object') {
    for (const key in value) if (hasOwnProperty(value, key)) return true;
    return false;
  }
  return value !== undefined;
};
