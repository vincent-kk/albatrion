import { isArray } from '@winglet/common-utils/filter';
import {
  deleteDataProperty,
  getDataProperty,
} from '@winglet/common-utils/object';

import { JSONPointer } from '@/json/JSONPointer/enum';
import { unescapePath } from '@/json/JSONPointer/utils/escape/unescapePath';
import type { JSONRoot } from '@/json/type';

import type { MovePatch } from '../../../patchModel';
import { JSONPatchError } from './error';
import { decodePatchFragment } from './decodePatchFragment';
import { isCircularMoveReference } from './isCircularMoveReference';
import { getArrayIndex } from './getArrayIndex';
import { isMissingMember } from './isMissingMember';
import { resolveFromParent } from './resolveFromParent';

/**
 * Removes the value at a MOVE operation's `from` location and returns it, the first half of
 * RFC 6902 4.4 ("remove from, then add at path").
 *
 * Array elements are spliced out, so no hole remains and later indexes shift down before the
 * target path is resolved. Members are read and deleted as own data properties, so a non-own
 * reserved member counts as missing. In immutable mode every container on the way to the
 * removed value is shallowly cloned first, keeping the removal inside the result.
 *
 * @param source - Root document of the patch application; an owned clone in immutable mode
 * @param from - JSON Pointer naming the value to move; `''` or `#` names the root, which is
 *               returned without removal because the following add replaces the whole document
 * @param patch - The MOVE operation, attached to error details
 * @param patchIndex - Position of the operation in the patch list, attached to error details
 * @param cloned - Containers already owned by the immutable result, or null in mutating mode
 * @param path - Already decoded target pointer checked before removing the source
 * @returns The removed value
 * @throws {JSONPatchError} `PATCH_PATH_INVALID` when `from` does not start with `/` or `#`,
 *         `PATCH_PATH_INVALID_INTERMEDIATE` when a container on the way is missing,
 *         `PATCH_ARRAY_INDEX_INVALID` for a malformed array index, and
 *         `PATCH_ARRAY_INDEX_OUT_OF_BOUNDS` or `PATCH_OBJECT_PROPERTY_NOT_FOUND` when the
 *         value itself does not exist
 */
export const removeMoveSource = (
  source: JSONRoot,
  from: string,
  patch: MovePatch,
  patchIndex: number,
  cloned: WeakSet<object> | null,
  path: string,
): unknown => {
  const segments = from.split(JSONPointer.Separator);
  if (segments[0] !== '') {
    if (from[0] === JSONPointer.Fragment)
      return removeMoveSource(source, decodePatchFragment(from, patch, patchIndex), patch, patchIndex, cloned, path);
    throw new JSONPatchError(
      'PATCH_PATH_INVALID',
      `Patch 'from' pointer '${from}' must start with '${JSONPointer.Separator}' or '${JSONPointer.Fragment}'`,
      { patch, index: patchIndex, from, operation: patch.op },
    );
  }
  if (isCircularMoveReference(from, path))
    throw new JSONPatchError(
      'PATCH_MOVE_INTO_DESCENDANT_FORBIDDEN',
      `Cannot move location '${patch.from}' to '${patch.path}' - target location is a descendant of the source location. This would create a circular reference.`,
      { patch, patchIndex, operation: patch.op, from: patch.from, path: patch.path },
    );
  const last = segments.length - 1;
  if (last === 0) return source;

  const parent = resolveFromParent(
    source,
    segments,
    from,
    patch,
    patchIndex,
    cloned,
  );

  const key = unescapePath(segments[last]);
  if (isArray(parent)) {
    const index = getArrayIndex(key, parent);
    if (index < parent.length) return parent.splice(index, 1)[0];
    throw new JSONPatchError(
      'PATCH_ARRAY_INDEX_OUT_OF_BOUNDS',
      `Cannot move element at index ${index}. Index must be less than array length ${parent.length}`,
      {
        patch,
        patchIndex,
        from,
        requestedIndex: index,
        arrayLength: parent.length,
        operation: patch.op,
      },
    );
  }
  const value = getDataProperty(parent, key);
  if (isMissingMember(parent, key, value))
    throw new JSONPatchError(
      'PATCH_OBJECT_PROPERTY_NOT_FOUND',
      `Cannot move property '${key}' - property does not exist on object`,
      { patch, patchIndex, from, missingProperty: key, operation: patch.op },
    );
  deleteDataProperty(parent, key);
  return value;
};
