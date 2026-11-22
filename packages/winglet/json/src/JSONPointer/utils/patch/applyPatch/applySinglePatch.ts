import { isArray } from '@winglet/common-utils/filter';
import {
  getDataProperty,
  isReservedName,
  setDataProperty,
} from '@winglet/common-utils/object';

import { JSONPointer } from '@/json/JSONPointer/enum';
import { unescapePath } from '@/json/JSONPointer/utils/escape/unescapePath';
import type { JSONRoot } from '@/json/type';

import { Operation, type Patch } from '../../patchModel';
import { applyRootOperation } from './utils/applyRootOperation';
import { copyObject } from './utils/copyObject';
import { decodePatchFragment } from './utils/decodePatchFragment';
import { JSONPatchError } from './utils/error';
import { getArrayIndex } from './utils/getArrayIndex';
import { handleArray } from './utils/handleArray';
import { handleObject } from './utils/handleObject';
import { readTransferValue } from './utils/readTransferValue';

/**
 * Applies a single JSON Patch operation to a source object or array.
 *
 * This function is the core implementation for applying individual JSON Patch operations.
 * It handles path traversal, validation, and delegates the actual operation execution
 * to specialized handlers based on the target type (object, array, or root).
 *
 * The function performs the following key operations:
 * - Parses and validates JSON Pointer paths
 * - Handles path escaping/unescaping according to RFC 6901
 * - Accesses reserved member names (__proto__, constructor, prototype) as
 *   opaque own data through the data-property primitives, so no patch input
 *   can reach or modify the prototype chain
 * - Validates intermediate path segments during traversal
 * - Delegates final operation to appropriate type-specific handlers
 * - Provides detailed error information for debugging
 *
 * Path traversal follows JSON Pointer specification:
 * - Paths starting with "/" represent object/array properties
 * - Empty path ("" or "#") represents the root document
 * - Special characters (~0, ~1) are unescaped to (~ and /)
 * - Array indices are validated and converted appropriately
 *
 * @param source - The source object or array to apply the patch to
 * @param patch - A single JSON Patch operation containing op, path, and optional value
 * @param patchIndex - The index of this patch in the original patches array (for error reporting)
 * @param cloned - Owned object references in immutable mode, or null in mutating mode
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6901 - JSON Pointer specification
 * @see https://datatracker.ietf.org/doc/html/rfc6902 - JSON Patch specification
 *
 * @returns The modified source object/array with the patch operation applied
 *
 * @throws {JSONPatchError} When the patch operation fails due to:
 *         - PATCH_TARGET_NOT_OBJECT: Target of operation is not an object/array when required
 *         - PATCH_PATH_INVALID_INTERMEDIATE: Invalid intermediate value during path traversal
 *         - PATCH_PATH_PROCESSING_ERROR: Unexpected error during path processing
 *         - Additional operation-specific errors from specialized handlers
 *
 * @example
 * ```typescript
 * const source = { user: { name: "John", age: 30 } };
 * const patch = { op: "replace", path: "/user/age", value: 31 };
 *
 * const result = applySinglePatch(source, patch, 0, null);
 * // Returns: { user: { name: "John", age: 31 } }
 * ```
 *
 * @example
 * ```typescript
 * const sourceArray = [1, 2, 3];
 * const patch = { op: "add", path: "/1", value: 5 };
 *
 * const result = applySinglePatch(sourceArray, patch, 0, null);
 * // Returns: [1, 5, 2, 3]
 * ```
 *
 * @example
 * ```typescript
 * // Root patch application
 * const source = { old: "data" };
 * const patch = { op: "replace", path: "", value: { new: "data" } };
 *
 * const result = applySinglePatch(source, patch, 0, null);
 * // Returns: { new: "data" }
 * ```
 *
 * @example
 * ```typescript
 * // Reserved member names are opaque own data — the prototype chain is
 * // unreachable, so this creates an own '__proto__' data container is absent:
 * const source = {};
 * const patch = { op: "add", path: "/__proto__/isAdmin", value: true };
 *
 * // Throws JSONPatchError with PATCH_PATH_INVALID_INTERMEDIATE, exactly like
 * // any other missing intermediate path; Object.prototype is never touched
 * applySinglePatch(source, patch, 0, null);
 * ```
 */
export const applySinglePatch = (
  source: JSONRoot,
  patch: Patch,
  patchIndex: number,
  cloned: WeakSet<object> | null,
): any => {
  const operation = patch.op;
  let path = patch.path;
  if (path === '') return applyRootOperation(source, patch, patchIndex, cloned);
  let segments = path.split('/');
  if (segments[0] !== '') {
    if (path[0] !== JSONPointer.Fragment)
      throw new JSONPatchError(
        'PATCH_PATH_INVALID',
        `Patch path '${patch.path}' must start with '${JSONPointer.Separator}' or '${JSONPointer.Fragment}'`,
        { patch, index: patchIndex, path: patch.path, operation },
      );
    path = decodePatchFragment(path, patch, patchIndex);
    if (path === '')
      return applyRootOperation(source, patch, patchIndex, cloned);
    segments = path.split('/');
  }
  // RFC 6902 4.4 and 4.5: move is "remove from, then add at path" and copy is "add a copy
  // at path", so both resolve their value first and then share the add handlers. The value
  // is read before the target path is walked, so the walk sees the document after removal
  let value: unknown;
  if (operation === Operation.ADD || operation === Operation.REPLACE)
    value = patch.value;
  else if (operation === Operation.MOVE || operation === Operation.COPY)
    value = readTransferValue(
      source,
      patch,
      operation,
      patchIndex,
      cloned,
      path,
    );

  let current: any = source;
  let cursor = 1;

  const segmentsLength = segments.length;
  while (cursor < segmentsLength) {
    let segment: string | number = unescapePath(segments[cursor]);

    if (cursor === segmentsLength - 1) {
      if (isArray(current)) {
        const arrayIndex = getArrayIndex(segment, current);
        return handleArray(
          patch,
          value,
          current,
          arrayIndex,
          source,
          patchIndex,
        );
      } else if (current && typeof current === 'object') {
        return handleObject(patch, value, current, segment, source, patchIndex);
      } else {
        throw new JSONPatchError(
          'PATCH_TARGET_NOT_OBJECT',
          `Cannot apply ${operation} operation to non-object value. Target path points to: ${typeof current}`,
          {
            patch,
            patchIndex: patchIndex,
            targetValue: current,
            targetType: typeof current,
            path: patch.path,
            operation: operation,
          },
        );
      }
    }

    if (isArray(current)) segment = getArrayIndex(segment, current);

    // Reserved names take the own-data path; ordinary keys keep plain access
    const reserved = typeof segment === 'string' && isReservedName(segment);
    let next: any = reserved
      ? getDataProperty(current, segment as string)
      : current[segment];
    if (
      cloned !== null &&
      next !== null &&
      typeof next === 'object' &&
      !cloned.has(next)
    ) {
      next = isArray(next) ? next.slice() : next instanceof Object ? { ...next } : copyObject(next);
      cloned.add(next);
      if (reserved) setDataProperty(current, segment as string, next);
      else current[segment] = next;
    }
    current = next;

    if (!current || typeof current !== 'object') {
      throw new JSONPatchError(
        'PATCH_PATH_INVALID_INTERMEDIATE',
        `Cannot traverse path '${patch.path}' - intermediate value at '${segments.slice(0, cursor + 1).join('/')}' is ${current === null ? 'null' : current === undefined ? 'undefined' : typeof current}, expected object or array`,
        {
          patch,
          patchIndex: patchIndex,
          intermediateValue: current,
          intermediateType: current === null ? 'null' : typeof current,
          failedAtPath: segments.slice(0, cursor + 1).join('/'),
          remainingPath: segments.slice(cursor + 1).join('/'),
          operation: operation,
        },
      );
    }
    cursor++;
  }

  throw new JSONPatchError(
    'PATCH_PATH_PROCESSING_ERROR',
    'Unexpected error while processing patch path - this should not happen',
    {
      patch,
      patchIndex: patchIndex,
      operation: operation,
      processedSegments: cursor,
      totalSegments: segmentsLength,
    },
  );
};
