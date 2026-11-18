import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import { JSONPointer } from '@/json/JSONPointer/enum';
import { unescapePath } from '@/json/JSONPointer/utils/escape/unescapePath';
import type { JSONRoot } from '@/json/type';

import type { Patch } from '../../../patchModel';
import { JSONPatchError } from './error';
import { decodePatchFragment } from './decodePatchFragment';
import { getArrayIndex } from './getArrayIndex';
import { resolveFromParent } from './resolveFromParent';

/**
 * Decides whether a COPY operation's `from` location exists after `getValue` read
 * `undefined` there. RFC 6902 4.5 requires the location to exist, and an own member set to
 * `undefined`, an array hole and an `undefined` element are locations that exist, as they
 * are for remove, replace, move and test. Resolves `from` the way a MOVE does, without
 * cloning or removing anything.
 *
 * @param source - Root document of the patch application
 * @param from - JSON Pointer that `getValue` resolved to `undefined`
 * @param patch - The COPY operation, attached to error details
 * @param patchIndex - Position of the operation in the patch list, attached to error details
 * @throws {JSONPatchError} `PATCH_PATH_INVALID_INTERMEDIATE` when a container on the way is
 *         missing, `PATCH_ARRAY_INDEX_INVALID` for a malformed array index, and
 *         `PATCH_ARRAY_INDEX_OUT_OF_BOUNDS` or `PATCH_OBJECT_PROPERTY_NOT_FOUND` when the
 *         location itself does not exist
 */
export const assertCopySourcePresent = (
  source: JSONRoot,
  from: string,
  patch: Patch,
  patchIndex: number,
): void => {
  const segments = from.split(JSONPointer.Separator);
  if (from[0] === JSONPointer.Fragment)
    return assertCopySourcePresent(source, decodePatchFragment(from, patch, patchIndex), patch, patchIndex);
  const parent = resolveFromParent(
    source,
    segments,
    from,
    patch,
    patchIndex,
    null,
  );
  const key = unescapePath(segments[segments.length - 1]);
  if (isArray(parent)) {
    const index = getArrayIndex(key, parent);
    if (index < parent.length) return;
    throw new JSONPatchError(
      'PATCH_ARRAY_INDEX_OUT_OF_BOUNDS',
      `Cannot copy element at index ${index}. Index must be less than array length ${parent.length}`,
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
  if (!hasOwnProperty(parent, key))
    throw new JSONPatchError(
      'PATCH_OBJECT_PROPERTY_NOT_FOUND',
      `Cannot copy property '${key}' - property does not exist on object`,
      { patch, patchIndex, from, missingProperty: key, operation: patch.op },
    );
};
