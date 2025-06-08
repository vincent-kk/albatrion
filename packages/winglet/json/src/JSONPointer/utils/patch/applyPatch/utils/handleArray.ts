import { equals } from '@winglet/common-utils/object';

import { getValueByPointer } from '@/json/JSONPointer/utils/manipulator/getValueByPointer';
import { setValueByPointer } from '@/json/JSONPointer/utils/manipulator/setValueByPointer';
import type { JsonArray, JsonRoot } from '@/json/type';

import { Operation, type Patch } from '../../type';
import { JsonPatchError } from './error';
import { isCircularMoveReference } from './isCircularMoveReference';

/**
 * Handles JSON Patch operations on array elements.
 * Supports all standard operations with index bounds validation.
 *
 * @param patch - The patch operation to apply
 * @param array - The target array to modify
 * @param index - The array index to operate on
 * @param source - The root source document for move/copy operations
 * @param patchIndex - The index of the patch for error reporting
 * @param strict - Whether to use strict equality checking
 * @returns The modified source document
 * @throws {JsonPatchError} When operation fails or index is out of bounds
 * @internal
 */
export const handleArray = (
  patch: Patch,
  array: JsonArray,
  index: number,
  source: JsonRoot,
  patchIndex: number,
  strict: boolean,
): any => {
  switch (patch.op) {
    case Operation.ADD:
      if (index <= array.length) {
        array.splice(index, 0, patch.value);
        return source;
      }
      throw new JsonPatchError(
        'PATCH_ARRAY_INDEX_OUT_OF_BOUNDS',
        `Cannot add element at index ${index}. Index must not exceed array length ${array.length}`,
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
        array[index] = patch.value;
        return source;
      }
      throw new JsonPatchError(
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
      throw new JsonPatchError(
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
        throw new JsonPatchError(
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
      throw new JsonPatchError(
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
    case Operation.MOVE:
      if (isCircularMoveReference(patch.from, patch.path))
        throw new JsonPatchError(
          'PATCH_MOVE_INTO_DESCENDANT_FORBIDDEN',
          `Cannot move location '${patch.from}' to '${patch.path}' - target location is a descendant of or identical to source location. This would create a circular reference.`,
          {
            patch,
            patchIndex,
            operation: patch.op,
            from: patch.from,
            path: patch.path,
          },
        );
      if (index > array.length) {
        throw new JsonPatchError(
          'PATCH_ARRAY_INDEX_OUT_OF_BOUNDS',
          `Cannot move element to index ${index}. Index must not exceed array length ${array.length}`,
          {
            patch,
            patchIndex,
            requestedIndex: index,
            arrayLength: array.length,
            maxValidIndex: array.length,
            operation: patch.op,
          },
        );
      }
      array[index] = getValueByPointer(source, patch.from);
      setValueByPointer(source, patch.from, undefined);
      return source;
    case Operation.COPY:
      if (isCircularMoveReference(patch.from, patch.path))
        throw new JsonPatchError(
          'PATCH_COPY_INTO_DESCENDANT_FORBIDDEN',
          `Cannot copy location '${patch.from}' to '${patch.path}' - target location is a descendant of or identical to source location. This would create a circular reference.`,
          {
            patch,
            patchIndex,
            operation: patch.op,
            from: patch.from,
            path: patch.path,
          },
        );
      if (index > array.length) {
        throw new JsonPatchError(
          'PATCH_ARRAY_INDEX_OUT_OF_BOUNDS',
          `Cannot copy element to index ${index}. Index must not exceed array length ${array.length}`,
          {
            patch,
            patchIndex,
            requestedIndex: index,
            arrayLength: array.length,
            maxValidIndex: array.length,
            operation: patch.op,
          },
        );
      }
      array[index] = getValueByPointer(source, patch.from);
      return source;
    default:
      throw new JsonPatchError(
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
