import type { JSONRoot } from '@/json/type';

import { Operation, type Patch } from '../../../patchModel';
import { handleRootPatch } from './handleRootPatch';
import { readTransferValue } from './readTransferValue';

/**
 * Resolves and applies an operation whose target is the root document.
 * @param source - Current document, owned before an operation removes a nested source
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
  if (operation === Operation.ADD || operation === Operation.REPLACE)
    value = patch.value;
  else if (operation === Operation.MOVE || operation === Operation.COPY)
    value = readTransferValue(source, patch, operation, patchIndex, cloned, '');
  return handleRootPatch(source, patch, value, patchIndex);
};
