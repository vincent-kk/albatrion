import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { isPlain } from './isPlain';

/**
 * Check whether a host distribution owns one child input by name or position.
 * @param input - Interpreted host input
 * @param name - Declared child name or array index
 * @param arrayHost - Whether array positions are valid child inputs
 * @returns Whether this write supplied the child position
 */
export const hasDistributedChildInput = (
  input: unknown, name: string, arrayHost: boolean,
): input is Record<string, unknown> | unknown[] => {
  if (isArray(input)) {
    if (!arrayHost) return false;
    const index = Number(name);
    return Number.isInteger(index) && index >= 0 && String(index) === name &&
      index < input.length;
  }
  return !arrayHost && isPlain(input) && hasOwnProperty(input, name);
};
