import { isArray } from '@winglet/common-utils/filter';
import { cloneLite } from '@winglet/common-utils/object';

import { getValue } from '@/json/JSONPointer/utils/manipulator/getValue';
import { JSONPointerError } from '@/json/JSONPointer/utils/manipulator/utils/error';
import type { JSONRoot } from '@/json/type';

import { Operation, type Patch } from '../../../patchModel';
import { assertCopySourcePresent } from './assertCopySourcePresent';
import { decodePatchFragment } from './decodePatchFragment';
import { JSONPatchError } from './error';
import { handleRootPatch } from './handleRootPatch';
import { removeMoveSource } from './removeMoveSource';

/**
 * Resolves and applies an operation whose target is the root document.
 * @param source - Current document, owned in immutable mode
 * @param patch - Original operation retained for error reporting
 * @param patchIndex - Position in the patch sequence
 * @param cloned - Owned containers, or null for mutable operation
 * @returns The replacement document or the successfully tested source
 */
export const applyRootOperation = (
  source: JSONRoot,
  patch: Patch,
  patchIndex: number,
  cloned: WeakSet<object> | null,
): unknown => {
  const operation = patch.op;
  let value: unknown;
  if (operation === Operation.ADD || operation === Operation.REPLACE) value = patch.value;
  else if (operation === Operation.MOVE || operation === Operation.COPY) {
    const from = patch.from;
    if (typeof from !== 'string')
      throw new JSONPatchError('PATCH_PATH_INVALID', `Patch operation '${operation}' requires a string 'from' pointer`, { patch, index: patchIndex, operation });
    if (operation === Operation.COPY) {
      let copied: unknown;
      try { copied = getValue(source, from); }
      catch (error) {
        if (error instanceof JSONPointerError && from[0] === '#') decodePatchFragment(from, patch, patchIndex);
        throw error;
      }
      if (copied === undefined) assertCopySourcePresent(source, from, patch, patchIndex);
      else value = cloneLite(copied);
    } else value = removeMoveSource(source, from, patch, patchIndex, cloned, '');
  }
  if (operation === Operation.MOVE && cloned !== null && value !== null && typeof value === 'object' && !cloned.has(value)) {
    const owned = isArray(value) ? value.slice() : { ...value };
    cloned.add(owned); value = owned;
  }
  return handleRootPatch(source, patch, value, patchIndex);
};
