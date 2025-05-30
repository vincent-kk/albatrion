import { clone } from '@/common-utils/utils/object/clone';

/**
 * Clones an object or returns the original value if it's not an object.
 *
 * @param target - The value to clone
 * @returns A cloned object or the original value
 */
export const cloneObject = <Value>(target: Value): Value =>
  typeof target === 'object' ? clone(target) : target;
