import { find } from '../../../navigation';
import type { FieldNodeRecord } from '../../../record';
import { FieldNodeEventType } from '../../../record';
import { updateFieldNodeGlobalErrors } from '../../../validation';
import { queueNonSettleEvent } from './queueNonSettleEvent';

/**
 * Resolve handed-over path keys against the replacement's committed shape.
 * @param root - New root after construction or mount
 * @returns Nothing; mounted occurrences own their external error references
 */
export const restoreAdoptedExternalErrors = <
  Self extends FieldNodeRecord<Self>,
>(
  root: Self,
): void => {
  const runtime = root.runtime;
  for (const [path, errors] of runtime.adoptedExternalErrors ?? []) {
    const node = find(root, path);
    if (!node) continue;
    (runtime.nodeErrors ??= new Map()).set(node, errors);
    if (node === root) updateFieldNodeGlobalErrors(root);
    else (runtime.externalContributions ??= new Map()).set(node, errors);
    runtime.adoptedExternalErrors?.delete(path);
    queueNonSettleEvent(node, FieldNodeEventType.UpdateError, errors);
  }
  if (!runtime.adoptedExternalErrors?.size)
    runtime.adoptedExternalErrors = undefined;
};
