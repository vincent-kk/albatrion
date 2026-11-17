import { isArrayIndex } from '@winglet/common-utils/filter';

import type { JSONArray } from '@/json/type';

import { JSONPatchError } from './error';

/** Largest JavaScript array index (2^32 - 2); a larger key names an ordinary property. */
const MAX_ARRAY_INDEX = 4294967294;

/**
 * Converts a string key to a valid array index for JSON Patch operations.
 * Handles special case "-" for end-of-array insertion and validates numeric indices.
 *
 * @param key - The key to convert (numeric string or "-")
 * @param array - The target array for validation
 * @returns The numeric index
 * @throws {JSONPatchError} When the key is not a valid array index
 * @internal
 */
export const getArrayIndex = (key: string, array: JSONArray): number => {
  if (key === '-') return array.length;
  // RFC 6901 4: an index is "0" or digits without a leading zero. ~~ truncates to 32
  // bits and would wrap ten digits onto a real element, so longer keys go through Number
  if (isArrayIndex(key) && (key.length === 1 || key.charCodeAt(0) !== 48)) {
    if (key.length < 10) return ~~key;
    const index = Number(key);
    if (index <= MAX_ARRAY_INDEX) return index;
  }
  throw new JSONPatchError(
    'PATCH_ARRAY_INDEX_INVALID',
    `Invalid array index '${key}'. Expected a non-negative integer or '-' for end-of-array`,
    {
      providedIndex: key,
      arrayLength: array.length,
      validFormat:
        'Expected format: non-negative integer (0, 1, 2, ...) or "-" for end-of-array',
    },
  );
};
