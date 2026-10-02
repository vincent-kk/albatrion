import type { SchemaNodeRecord } from '../../../record';
import { SchemaNodeEventType } from '../../../record';
import { find } from '../../../navigation';
import { queueNonSettleEvent } from './queueNonSettleEvent';

/**
 * Resolve handed-over path keys against the replacement's committed shape.
 * @param root - New root after construction or mount
 * @returns Nothing; mounted occurrences own their external error references
 */
export const restoreAdoptedExternalErrors = <Self extends SchemaNodeRecord<Self>>(
  root: Self,
): void => {
  const runtime = root.runtime;
  for (const [path, errors] of runtime.adoptedExternalErrors ?? []) {
    const node = find(root, path);
    if (!node) continue;
    (runtime.nodeErrors ??= new Map()).set(node, errors);
    runtime.adoptedExternalErrors?.delete(path);
    queueNonSettleEvent(node, SchemaNodeEventType.UpdateError, errors);
  }
  if (!runtime.adoptedExternalErrors?.size) runtime.adoptedExternalErrors = undefined;
};
