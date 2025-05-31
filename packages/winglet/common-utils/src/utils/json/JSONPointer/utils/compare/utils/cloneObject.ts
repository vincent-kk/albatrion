import { clone } from '@/common-utils/utils/object/clone';

/**
 * Clones an object or returns the original value if it's not an object.
 *
 * @param value - The value to clone
 * @returns A cloned object or the original value
 * @note undefined is converted to null
 */
export const cloneObject = <Value>(value: Value): Value => {
  if (value === undefined) return null as Value;
  return typeof value === 'object' ? clone(value) : value;
};
