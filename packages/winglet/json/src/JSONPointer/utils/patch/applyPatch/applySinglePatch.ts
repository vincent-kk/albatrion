import { isArray } from '@winglet/common-utils/filter';
import { getDataProperty, setDataProperty } from '@winglet/common-utils/object';

import { JSONPointer } from '@/json/JSONPointer/enum';
import { unescapePath } from '@/json/JSONPointer/utils/escape/unescapePath';
import type { JsonRoot } from '@/json/type';

import { Operation, type Patch } from '../../patchModel';
import { ensureOwnedFromPath } from './utils/ensureOwnedFromPath';
import { JsonPatchError } from './utils/error';
import { getArrayIndex } from './utils/getArrayIndex';
import { handleArray } from './utils/handleArray';
import { handleObject } from './utils/handleObject';
import { handleRootPatch } from './utils/handleRootPatch';

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
 * @param strict - Whether to enforce strict validation rules
 * @param cloned - Owned object references in immutable mode, or null in mutating mode
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6901 - JSON Pointer specification
 * @see https://datatracker.ietf.org/doc/html/rfc6902 - JSON Patch specification
 *
 * @returns The modified source object/array with the patch operation applied
 *
 * @throws {JsonPatchError} When the patch operation fails due to:
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
 * const result = applySinglePatch(source, patch, 0, false, true, null);
 * // Returns: { user: { name: "John", age: 31 } }
 * ```
 *
 * @example
 * ```typescript
 * const sourceArray = [1, 2, 3];
 * const patch = { op: "add", path: "/1", value: 5 };
 *
 * const result = applySinglePatch(sourceArray, patch, 0, false, true, null);
 * // Returns: [1, 5, 2, 3]
 * ```
 *
 * @example
 * ```typescript
 * // Root patch application
 * const source = { old: "data" };
 * const patch = { op: "replace", path: "", value: { new: "data" } };
 *
 * const result = applySinglePatch(source, patch, 0, false, true, null);
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
 * // Throws JsonPatchError with PATCH_PATH_INVALID_INTERMEDIATE, exactly like
 * // any other missing intermediate path; Object.prototype is never touched
 * applySinglePatch(source, patch, 0, false, null);
 * ```
 */
export const applySinglePatch = (
  source: JsonRoot,
  patch: Patch,
  patchIndex: number,
  strict: boolean,
  cloned: WeakSet<object> | null,
): any => {
  // 루트 패치 처리
  if (patch.path === '' || patch.path === JSONPointer.Fragment)
    return handleRootPatch(source, patch, patchIndex, strict);

  // Judged by operation rather than key presence: `move` and `copy` require a `from`
  // pointer, and a missing or non-string one must surface as a patch error rather than
  // as a TypeError thrown from somewhere deeper
  if (patch.op === Operation.MOVE || patch.op === Operation.COPY) {
    if (typeof patch.from !== 'string')
      throw new JsonPatchError(
        'PATCH_PATH_INVALID',
        `Patch operation '${patch.op}' requires a string 'from' pointer`,
        { patch, index: patchIndex, operation: patch.op },
      );
    if (patch.op === Operation.MOVE && cloned !== null)
      ensureOwnedFromPath(source, patch.from, cloned);
  }

  const segments = patch.path.split('/');

  // Same set compilePointer accepts: a leading separator or the URI fragment form.
  // The walk starts at index 1, so anything else silently drops its first segment
  // and edits somewhere the caller never named
  if (segments[0] !== '' && segments[0] !== JSONPointer.Fragment)
    throw new JsonPatchError(
      'PATCH_PATH_INVALID',
      `Patch path '${patch.path}' must start with '${JSONPointer.Separator}' or '${JSONPointer.Fragment}'`,
      { patch, index: patchIndex, path: patch.path, operation: patch.op },
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
          current,
          arrayIndex,
          source,
          patchIndex,
          strict,
        );
      } else if (current && typeof current === 'object') {
        return handleObject(
          patch,
          current,
          segment,
          source,
          patchIndex,
          strict,
        );
      } else {
        throw new JsonPatchError(
          'PATCH_TARGET_NOT_OBJECT',
          `Cannot apply ${patch.op} operation to non-object value. Target path points to: ${typeof current}`,
          {
            patch,
            patchIndex: patchIndex,
            targetValue: current,
            targetType: typeof current,
            path: patch.path,
            operation: patch.op,
          },
        );
      }
    }

    if (isArray(current)) segment = getArrayIndex(segment, current);

    let next: any = getDataProperty(current, segment as string);
    if (
      cloned !== null &&
      next !== null &&
      typeof next === 'object' &&
      !cloned.has(next)
    ) {
      next = isArray(next) ? next.slice() : { ...next };
      cloned.add(next);
      setDataProperty(current, segment as string, next);
    }
    current = next;

    // 경로가 더 남았는데 현재 값이 객체가 아닌 경우
    if (!current || typeof current !== 'object') {
      throw new JsonPatchError(
        'PATCH_PATH_INVALID_INTERMEDIATE',
        `Cannot traverse path '${patch.path}' - intermediate value at '${segments.slice(0, cursor + 1).join('/')}' is ${current === null ? 'null' : current === undefined ? 'undefined' : typeof current}, expected object or array`,
        {
          patch,
          patchIndex: patchIndex,
          intermediateValue: current,
          intermediateType: current === null ? 'null' : typeof current,
          failedAtPath: segments.slice(0, cursor + 1).join('/'),
          remainingPath: segments.slice(cursor + 1).join('/'),
          operation: patch.op,
        },
      );
    }
    cursor++;
  }

  throw new JsonPatchError(
    'PATCH_PATH_PROCESSING_ERROR',
    'Unexpected error while processing patch path - this should not happen',
    {
      patch,
      patchIndex: patchIndex,
      operation: patch.op,
      processedSegments: cursor,
      totalSegments: segmentsLength,
    },
  );
};
