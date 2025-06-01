import {
  CONSTRUCTOR_KEY,
  PROTOTYPE_ASSESS_KEY,
  PROTOTYPE_KEY,
} from '@/common-utils/utils/json/JSONPointer/constants/prototypeKey';

/**
 * Detects potential prototype pollution attempts in JSON Patch paths.
 * Checks for dangerous property names like "__proto__" and "constructor.prototype".
 *
 * @param key - The current path segment
 * @param keys - The full path segments array
 * @param index - The current segment index
 * @returns True if the modification could affect prototype chain
 * @internal
 */
export const isPrototypeModification = (
  key: string | number,
  keys: string[],
  index: number,
): boolean =>
  key === PROTOTYPE_ASSESS_KEY ||
  (key === PROTOTYPE_KEY && index > 0 && keys[index - 1] === CONSTRUCTOR_KEY);
