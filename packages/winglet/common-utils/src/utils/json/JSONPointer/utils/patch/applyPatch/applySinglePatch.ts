import type { Dictionary } from '@aileron/declare';

import { isArray } from '@/common-utils/utils/filter/isArray';
import { unescapePointer } from '@/common-utils/utils/json/JSONPointer/utils/escape/unescapePointer';

import type { Patch } from '../type';
import { JsonPatchError } from './utils/error';
import { getArrayIndex } from './utils/getArrayIndex';
import { handleArray } from './utils/handleArray';
import { handleObject } from './utils/handleObject';
import { handleRootPatch } from './utils/handleRootPatch';
import { isPrototypeModification } from './utils/isPrototypeModification';

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
 * - Provides security protection against prototype pollution
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
 * @param protectPrototype - Whether to prevent prototype pollution attempts
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6901 - JSON Pointer specification
 * @see https://datatracker.ietf.org/doc/html/rfc6902 - JSON Patch specification
 *
 * @returns The modified source object/array with the patch operation applied
 *
 * @throws {JsonPatchError} When the patch operation fails due to:
 *         - SECURITY_PROTOTYPE_MODIFICATION_FORBIDDEN: Attempt to modify prototype properties
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
 * const result = applySinglePatch(source, patch, 0, false, true);
 * // Returns: { user: { name: "John", age: 31 } }
 * ```
 *
 * @example
 * ```typescript
 * const sourceArray = [1, 2, 3];
 * const patch = { op: "add", path: "/1", value: 5 };
 *
 * const result = applySinglePatch(sourceArray, patch, 0, false, true);
 * // Returns: [1, 5, 2, 3]
 * ```
 *
 * @example
 * ```typescript
 * // Root patch application
 * const source = { old: "data" };
 * const patch = { op: "replace", path: "", value: { new: "data" } };
 *
 * const result = applySinglePatch(source, patch, 0, false, true);
 * // Returns: { new: "data" }
 * ```
 *
 * @example
 * ```typescript
 * // Security protection - this will throw an error
 * const source = {};
 * const maliciousPatch = { op: "add", path: "/__proto__/isAdmin", value: true };
 *
 * // Throws JsonPatchError with SECURITY_PROTOTYPE_MODIFICATION_FORBIDDEN
 * applySinglePatch(source, maliciousPatch, 0, false, true);
 * ```
 */
export const applySinglePatch = (
  source: Dictionary | Array<any>,
  patch: Patch,
  patchIndex: number,
  strict: boolean,
  protectPrototype: boolean,
): any => {
  // 루트 패치 처리
  if (patch.path === '' || patch.path === '#')
    return handleRootPatch(source, patch, patchIndex, strict);

  const segments = patch.path.split('/');
  let current: any = source;
  let cursor = 1;

  const segmentsLength = segments.length;
  while (cursor < segmentsLength) {
    let segment: string | number = segments[cursor];

    if (segment.indexOf('~') !== -1) segment = unescapePointer(segment);

    if (protectPrototype && isPrototypeModification(segment, segments, cursor))
      throw new JsonPatchError(
        'SECURITY_PROTOTYPE_MODIFICATION_FORBIDDEN',
        'Modifying prototype properties (__proto__, constructor.prototype) is forbidden for security reasons',
        {
          patch,
          index: patchIndex,
          segment,
          path: segments.slice(0, cursor + 1).join('/'),
          operation: patch.op,
        },
      );

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

    current = current[segment];

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
