import { isArrayIndex } from '@/common-utils/utils/filter/isArrayIndex';

import { JsonPatchError } from './error';

/**
 * Converts a string key to a valid array index for JSON Patch operations.
 * Handles special case "-" for end-of-array insertion and validates numeric indices.
 *
 * @param key - The key to convert (numeric string or "-")
 * @param array - The target array for validation
 * @returns The numeric index
 * @throws {JsonPatchError} When the key is not a valid array index
 * @internal
 */
export const getArrayIndex = (key: string, array: any[]): number => {
  if (key === '-') return array.length;
  if (isArrayIndex(key)) return ~~key;
  throw new JsonPatchError(
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
