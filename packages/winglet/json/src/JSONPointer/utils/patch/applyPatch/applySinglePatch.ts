import { isArray } from '@winglet/common-utils/filter';
import {
  cloneLite,
  getDataProperty,
  isReservedName,
  setDataProperty,
} from '@winglet/common-utils/object';

import { JSONPointer } from '@/json/JSONPointer/enum';
import { unescapePath } from '@/json/JSONPointer/utils/escape/unescapePath';
import { getValue } from '@/json/JSONPointer/utils/manipulator/getValue';
import type { JSONRoot } from '@/json/type';

import { Operation, type Patch } from '../../patchModel';
import { assertCopySourcePresent } from './utils/assertCopySourcePresent';
import { JSONPatchError } from './utils/error';
import { decodePatchFragment } from './utils/decodePatchFragment';
import { getArrayIndex } from './utils/getArrayIndex';
import { handleArray } from './utils/handleArray';
import { handleObject } from './utils/handleObject';
import { handleRootPatch } from './utils/handleRootPatch';
import { isCircularMoveReference } from './utils/isCircularMoveReference';
import { removeMoveSource } from './utils/removeMoveSource';

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
  const path = patch.path[0] === '#' ? decodePatchFragment(patch.path, patch, patchIndex) : patch.path;
  // RFC 6902 4.4 and 4.5: move is "remove from, then add at path" and copy is "add a copy
  // at path", so both resolve their value first and then share the add handlers. The value
  // is read before the target path is walked, so the walk sees the document after removal
  let value: unknown;
  if (operation === Operation.ADD || operation === Operation.REPLACE)
    value = patch.value;
  else if (operation === Operation.MOVE || operation === Operation.COPY) {
    // Judged by operation rather than key presence: `move` and `copy` require a `from`
    // pointer, and a missing or non-string one must surface as a patch error rather than
    // as a TypeError thrown from somewhere deeper
    let from = patch.from;
    if (typeof from !== 'string')
      throw new JSONPatchError(
        'PATCH_PATH_INVALID',
        `Patch operation '${operation}' requires a string 'from' pointer`,
        { patch, index: patchIndex, operation: operation },
      );
    if (from[0] === '#') from = decodePatchFragment(from, patch, patchIndex);
    if (operation === Operation.COPY) {
      const copied = getValue(source, from);
      // RFC 6902 4.5: the from location must exist. Only an undefined read can name a
      // missing location, so only that read pays for the second walk
      if (copied === undefined)
        assertCopySourcePresent(source, from, patch, patchIndex);
      else value = cloneLite(copied);
    } else if (isCircularMoveReference(from, path))
      throw new JSONPatchError(
        'PATCH_MOVE_INTO_DESCENDANT_FORBIDDEN',
        `Cannot move location '${patch.from}' to '${patch.path}' - target location is a descendant of the source location. This would create a circular reference.`,
        {
          patch,
          patchIndex,
          operation: operation,
          from: patch.from,
          path: patch.path,
        },
      );
    else
      value = removeMoveSource(source, from, patch, patchIndex, cloned);
  }

  if (path === '') {
    if (operation === Operation.MOVE && cloned !== null && value !== null && typeof value === 'object' && !cloned.has(value)) {
      const owned = isArray(value) ? value.slice() : { ...value };
      cloned.add(owned);
      value = owned;
    }
    return handleRootPatch(source, patch, value, patchIndex);
  }

  const segments = path.split('/');

  // Same set compilePointer accepts: a leading separator or the URI fragment form.
  // The walk starts at index 1, so anything else silently drops its first segment
  // and edits somewhere the caller never named
  if (segments[0] !== '' && segments[0] !== JSONPointer.Fragment)
    throw new JSONPatchError(
      'PATCH_PATH_INVALID',
      `Patch path '${patch.path}' must start with '${JSONPointer.Separator}' or '${JSONPointer.Fragment}'`,
      { patch, index: patchIndex, path: patch.path, operation: operation },
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
      next = isArray(next) ? next.slice() : { ...next };
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
