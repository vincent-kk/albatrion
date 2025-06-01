import { equals } from '@winglet/common-utils';

import { getValueByPointer } from '@/json/JSONPointer/utils/manipulator/getValueByPointer';
import type { JsonRoot } from '@/json/type';

import { Operation, type Patch } from '../../type';
import { JsonPatchError } from './error';
import { isCircularMoveReference } from './isCircularMoveReference';

/**
 * Handles JSON Patch operations targeting the root document (empty path).
 * Supports all standard operations: add, remove, replace, move, copy, test.
 *
 * @param source - The source document
 * @param patch - The patch operation to apply
 * @param patchIndex - The index of the patch for error reporting
 * @param strict - Whether to use strict equality checking
 * @returns The modified document or null for remove operations
 * @throws {JsonPatchError} When operation fails or is invalid
 * @internal
 */
export const handleRootPatch = (
  source: JsonRoot,
  patch: Patch,
  patchIndex: number,
  strict: boolean,
): any => {
  switch (patch.op) {
    case Operation.ADD:
    case Operation.REPLACE:
      return patch.value;
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
      return getValueByPointer(source, patch.from);
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
      return getValueByPointer(source, patch.from);
    case Operation.TEST:
      if (!strict || equals(source, patch.value)) return source;
      throw new JsonPatchError(
        'PATCH_TEST_FAILED',
        'Test operation failed at root level. Expected value does not match actual document value',
        {
          patch,
          patchIndex,
          actualValue: source,
          expectedValue: patch.value,
          path: '/',
          operation: patch.op,
        },
      );
    case Operation.REMOVE:
      return null;
    default:
      throw new JsonPatchError(
        'PATCH_OPERATION_INVALID',
        `Unsupported operation '${(patch as Patch).op}'. Valid operations for JSON Patch are: add, remove, replace, move, copy, test`,
        {
          patch,
          patchIndex,
          providedOperation: (patch as Patch).op,
          validOperations: ['add', 'remove', 'replace', 'move', 'copy', 'test'],
        },
      );
  }
};
