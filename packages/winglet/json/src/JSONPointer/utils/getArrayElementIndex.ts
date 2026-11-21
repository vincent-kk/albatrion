import { isArrayIndex } from '@winglet/common-utils/filter';

/** Largest ECMAScript array index. Larger decimal keys are ordinary properties. */
const MAX_ARRAY_INDEX = 4294967294;

/**
 * Parse a canonical decimal array element key shared by pointer reads and patch operations.
 * @param key A decoded reference token.
 * @returns Its array index, or -1 for a token that does not name an array element.
 */
export function getArrayElementIndex(key: string): number {
  if (!isArrayIndex(key) || (key.length !== 1 && key.charCodeAt(0) === 48))
    return -1;
  if (key.length < 10) return ~~key;
  const index = Number(key);
  return index <= MAX_ARRAY_INDEX ? index : -1;
}
