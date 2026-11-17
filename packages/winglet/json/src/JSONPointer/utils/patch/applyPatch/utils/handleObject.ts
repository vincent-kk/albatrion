import { hasOwnProperty } from '@winglet/common-utils/lib';
import {
  deleteDataProperty,
  equals,
  setDataProperty,
} from '@winglet/common-utils/object';

import type { JSONObject, JSONRoot } from '@/json/type';

import { Operation, type Patch } from '../../../patchModel';
import { JSONPatchError } from './error';

/**
 * Handles JSON Patch operations on object properties.
 * Supports all standard operations with property existence validation.
 *
 * @param patch - The patch operation to apply
 * @param value - The value to write: `patch.value` for add and replace, the removed value
 *                for move, and a deep copy of the `from` value for copy
 * @param object - The target object to modify
 * @param key - The property key to operate on
 * @param source - The root source document for move/copy operations
 * @param patchIndex - The index of the patch for error reporting
 * @param strict - Whether to use strict equality checking
 * @returns The modified source document
 * @throws {JSONPatchError} When operation fails or property validation fails
 * @internal
 */
export const handleObject = (
  patch: Patch,
  value: unknown,
  object: JSONObject,
  key: string,
  source: JSONRoot,
  patchIndex: number,
  strict: boolean,
): any => {
  switch (patch.op) {
    case Operation.ADD:
    case Operation.REPLACE:
    case Operation.MOVE:
    case Operation.COPY:
      setDataProperty(object, key, value);
      return source;
    case Operation.REMOVE:
      if (!hasOwnProperty(object, key)) {
        throw new JSONPatchError(
          'PATCH_OBJECT_PROPERTY_NOT_FOUND',
          `Cannot remove property '${key}' - property does not exist on object`,
          {
            patch,
            patchIndex,
            missingProperty: key,
            availableProperties: Object.keys(object),
            operation: patch.op,
          },
        );
      }
      deleteDataProperty(object, key);
      return source;
    case Operation.TEST:
      if (!hasOwnProperty(object, key)) {
        throw new JSONPatchError(
          'PATCH_OBJECT_PROPERTY_NOT_FOUND',
          `Cannot test property '${key}' - property does not exist on object`,
          {
            patch,
            patchIndex,
            missingProperty: key,
            availableProperties: Object.keys(object),
            expectedValue: patch.value,
            operation: patch.op,
          },
        );
      }
      if (!strict || equals(object[key], patch.value)) return source;
      throw new JSONPatchError(
        'PATCH_TEST_FAILED',
        `Test operation failed for property '${key}'. Expected value does not match actual value`,
        {
          patch,
          patchIndex,
          actualValue: object[key],
          expectedValue: patch.value,
          property: key,
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
