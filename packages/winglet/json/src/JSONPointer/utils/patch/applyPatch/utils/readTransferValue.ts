import { cloneLite } from '@winglet/common-utils/object';

import { getValue } from '@/json/JSONPointer/utils/manipulator';
import type { JSONRoot } from '@/json/type';

import { Operation, type CopyPatch, type MovePatch } from '../../../patchModel';
import { assertCopySourcePresent } from './assertCopySourcePresent';
import { decodePatchFragment } from './decodePatchFragment';
import { JSONPatchError } from './error';
import { removeMoveSource } from './removeMoveSource';

/**
 * Resolve a transfer's value before the target is walked and written.
 * @param source Current document, owned if a move will remove nested content.
 * @param patch Original transfer, including its written pointers.
 * @param operation Transfer operation selected by the caller.
 * @param patchIndex Index used for structured patch errors.
 * @param cloned Containers owned by the immutable result, or null for mutable mode.
 * @param path Decoded target pointer, with an empty string naming the root.
 * @returns An independent copy or the value removed by a move.
 */
export function readTransferValue(
  source: JSONRoot,
  patch: CopyPatch | MovePatch,
  operation: CopyPatch['op'] | MovePatch['op'],
  patchIndex: number,
  cloned: WeakSet<object> | null,
  path: string,
): unknown {
  const from = patch.from;
  if (typeof from !== 'string')
    throw new JSONPatchError(
      'PATCH_PATH_INVALID',
      `Patch operation '${operation}' requires a string 'from' pointer`,
      { patch, index: patchIndex, operation },
    );
  if (operation === Operation.MOVE)
    return removeMoveSource(source, from, patch, patchIndex, cloned, path);

  let copied: unknown;
  try {
    copied =
      path === '' && (from === '' || from === '#')
        ? source
        : getValue(source, from);
  } catch (error) {
    if (from[0] === '#') decodePatchFragment(from, patch, patchIndex);
    throw error;
  }
  if (copied !== undefined) return cloneLite(copied);
  assertCopySourcePresent(source, from, patch, patchIndex);
  return undefined;
}
