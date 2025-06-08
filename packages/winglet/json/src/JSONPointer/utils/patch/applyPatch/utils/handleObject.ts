import { equals } from '@winglet/common-utils/object';

import { getValueByPointer } from '@/json/JSONPointer/utils/manipulator/getValueByPointer';
import { setValueByPointer } from '@/json/JSONPointer/utils/manipulator/setValueByPointer';
import type { JsonObject, JsonRoot } from '@/json/type';

import { Operation, type Patch } from '../../type';
import { JsonPatchError } from './error';
import { isCircularMoveReference } from './isCircularMoveReference';

/**
 * Handles JSON Patch operations on object properties.
 * Supports all standard operations with property existence validation.
 *
 * @param patch - The patch operation to apply
 * @param object - The target object to modify
 * @param key - The property key to operate on
 * @param source - The root source document for move/copy operations
 * @param patchIndex - The index of the patch for error reporting
 * @param strict - Whether to use strict equality checking
 * @returns The modified source document
 * @throws {JsonPatchError} When operation fails or property validation fails
 * @internal
 */
export const handleObject = (
  patch: Patch,
  object: JsonObject,
  key: string,
  source: JsonRoot,
  patchIndex: number,
  strict: boolean,
): any => {
  switch (patch.op) {
    case Operation.ADD:
    case Operation.REPLACE:
      object[key] = patch.value;
      return source;
    case Operation.REMOVE:
      if (!(key in object)) {
        throw new JsonPatchError(
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
      delete object[key];
      return source;
    case Operation.TEST:
      if (!(key in object)) {
        throw new JsonPatchError(
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
      throw new JsonPatchError(
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
      object[key] = getValueByPointer(source, patch.from);
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
      object[key] = getValueByPointer(source, patch.from);
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
