import { isArray } from '@winglet/common-utils/filter';
import {
  getDataProperty,
  setDataProperty,
} from '@winglet/common-utils/object';

import { unescapePath } from '@/json/JSONPointer/utils/escape/unescapePath';
import type { JSONRoot } from '@/json/type';

import type { Patch } from '../../../patchModel';
import { copyObject } from './copyObject';
import { JSONPatchError } from './error';
import { getArrayIndex } from './getArrayIndex';

/**
 * Walks a MOVE or COPY operation's `from` pointer down to the container of its last
 * segment, reading members as own data properties, so a non-own reserved member counts as
 * missing. In immutable mode every container on the way is shallowly cloned first, so a
 * removal from the returned container stays inside the result.
 *
 * @param source - Root document of the patch application; an owned clone in immutable mode
 * @param segments - `from` split on `/`, with at least two entries; the last is not walked
 * @param from - The `from` pointer, attached to error details
 * @param patch - The operation, attached to error details
 * @param patchIndex - Position of the operation in the patch list, attached to error details
 * @param cloned - Containers already owned by the immutable result, or null to walk without
 *                 cloning
 * @returns The object or array that holds the last segment of `from`
 * @throws {JSONPatchError} `PATCH_PATH_INVALID_INTERMEDIATE` when a container on the way is
 *         missing, and `PATCH_ARRAY_INDEX_INVALID` for a malformed array index on the way
 */
export const resolveFromParent = (
  source: JSONRoot,
  segments: string[],
  from: string,
  patch: Patch,
  patchIndex: number,
  cloned: WeakSet<object> | null,
): any => {
  const last = segments.length - 1;
  let parent: any = source;
  for (let cursor = 1; cursor < last; cursor++) {
    const segment = unescapePath(segments[cursor]);
    const index = isArray(parent) ? getArrayIndex(segment, parent) : -1;
    let next: any =
      index === -1 ? getDataProperty(parent, segment) : parent[index];
    if (next === null || typeof next !== 'object')
      throw new JSONPatchError(
        'PATCH_PATH_INVALID_INTERMEDIATE',
        `Cannot traverse 'from' pointer '${from}' - intermediate value at '${segments.slice(0, cursor + 1).join('/')}' is not an object or array`,
        {
          patch,
          patchIndex,
          from,
          failedAtPath: segments.slice(0, cursor + 1).join('/'),
          operation: patch.op,
        },
      );
    if (cloned !== null && !cloned.has(next)) {
      next = isArray(next) ? next.slice() : copyObject(next);
      cloned.add(next);
      if (index === -1) setDataProperty(parent, segment, next);
      else parent[index] = next;
    }
    parent = next;
  }
  return parent;
};
