import { equals } from '@winglet/common-utils/object';

import type { JSONRoot } from '@/json/type';

import { Operation, type Patch } from '../../../patchModel';
import { JSONPatchError } from './error';

/**
 * Handles JSON Patch operations targeting the root document (empty path).
 * Supports all standard operations: add, remove, replace, move, copy, test.
 *
 * @param source - The source document
 * @param patch - The patch operation to apply
 * @param value - The replacement document: `patch.value` for add and replace, the `from`
 *                value for move, and a deep copy of it for copy
 * @param patchIndex - The index of the patch for error reporting
 * @returns The modified document or null for remove operations
 * @throws {JSONPatchError} When operation fails or is invalid
 * @internal
 */
export const handleRootPatch = (
  source: JSONRoot,
  patch: Patch,
  value: unknown,
  patchIndex: number,
): any => {
  switch (patch.op) {
    case Operation.ADD:
    case Operation.REPLACE:
    case Operation.MOVE:
    case Operation.COPY:
      return value;
    case Operation.TEST:
      if (source === patch.value || equals(source, patch.value)) return source;
      throw new JSONPatchError(
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
      throw new JSONPatchError(
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
