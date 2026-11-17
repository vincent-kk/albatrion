import { equals } from '@winglet/common-utils/object';

import type { JSONArray, JSONRoot } from '@/json/type';

import { Operation, type Patch } from '../../../patchModel';
import { JSONPatchError } from './error';

/**
 * Handles JSON Patch operations on array elements.
 * Supports all standard operations with index bounds validation.
 *
 * @param patch - The patch operation to apply
 * @param value - The value to write: `patch.value` for add and replace, the removed value
 *                for move, and a deep copy of the `from` value for copy
 * @param array - The target array to modify
 * @param index - The array index to operate on
 * @param source - The root source document for move/copy operations
 * @param patchIndex - The index of the patch for error reporting
 * @param strict - Whether to use strict equality checking
 * @returns The modified source document
 * @throws {JSONPatchError} When operation fails or index is out of bounds
 * @internal
 */
export const handleArray = (
  patch: Patch,
  value: unknown,
  array: JSONArray,
  index: number,
  source: JSONRoot,
  patchIndex: number,
  strict: boolean,
): any => {
  switch (patch.op) {
    // Move and copy are adds at the target (RFC 6902 4.4, 4.5), so an index inserts
    case Operation.ADD:
    case Operation.MOVE:
    case Operation.COPY:
      if (index <= array.length) {
        array.splice(index, 0, value);
        return source;
      }
      throw new JSONPatchError(
        'PATCH_ARRAY_INDEX_OUT_OF_BOUNDS',
        `Cannot ${patch.op} element at index ${index}. Index must not exceed array length ${array.length}`,
        {
          patch,
          patchIndex,
          requestedIndex: index,
          arrayLength: array.length,
          maxValidIndex: array.length,
          operation: patch.op,
        },
      );
    case Operation.REPLACE:
      if (index < array.length) {
        array[index] = value;
        return source;
      }
      throw new JSONPatchError(
        'PATCH_ARRAY_INDEX_OUT_OF_BOUNDS',
        `Cannot replace element at index ${index}. Index must be less than array length ${array.length}`,
        {
          patch,
          patchIndex,
          requestedIndex: index,
          arrayLength: array.length,
          maxValidIndex: array.length - 1,
          operation: patch.op,
        },
      );
    case Operation.REMOVE:
      if (index < array.length) {
        array.splice(index, 1);
        return source;
      }
      throw new JSONPatchError(
        'PATCH_ARRAY_INDEX_OUT_OF_BOUNDS',
        `Cannot remove element at index ${index}. Index must be less than array length ${array.length}`,
        {
          patch,
          patchIndex,
          requestedIndex: index,
          arrayLength: array.length,
          maxValidIndex: array.length - 1,
          operation: patch.op,
        },
      );
    case Operation.TEST:
      if (index >= array.length) {
        throw new JSONPatchError(
          'PATCH_ARRAY_INDEX_OUT_OF_BOUNDS',
          `Cannot test element at index ${index}. Index must be less than array length ${array.length}`,
          {
            patch,
            patchIndex,
            requestedIndex: index,
            arrayLength: array.length,
            maxValidIndex: array.length - 1,
            operation: patch.op,
          },
        );
      }
      if (!strict || equals(array[index], patch.value)) return source;
      throw new JSONPatchError(
        'PATCH_TEST_FAILED',
        `Test operation failed at array index ${index}. Expected value does not match actual value`,
        {
          patch,
          patchIndex,
          actualValue: array[index],
          expectedValue: patch.value,
          index,
          operation: patch.op,
        },
      );
    default:
      throw new JSONPatchError(
        'PATCH_OPERATION_INVALID',
        `Unsupported operation '${(patch as Patch).op}'. Valid operations are: add, remove, replace, move, copy, test`,
        {
          patch,
          patchIndex,
          providedOperation: (patch as Patch).op,
          validOperations: ['add', 'remove', 'replace', 'move', 'copy', 'test'],
        },
      );
  }
};
