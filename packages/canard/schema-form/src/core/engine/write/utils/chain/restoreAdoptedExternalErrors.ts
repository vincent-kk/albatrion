import { find } from '../../../navigation';
import type { FieldNodeRecord } from '../../../record';
import { FieldNodeEventType, queueNonSettleEvent } from '../../../record';
import { updateFieldNodeGlobalErrors } from '../../../validation';

/** Annotates the lazily created `nodeErrors`; an argument-less `new Map()` would be `Map<any, any>`. */
type NodeErrors = Map<unknown, readonly { dataPath: string }[]>;
/** Annotates the lazily created `externalContributions`; an argument-less `new Map()` would be `Map<any, any>`. */
type ExternalContributions = Map<unknown, readonly { dataPath: string }[]>;

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
    const nodeErrors: NodeErrors = (runtime.nodeErrors ??= new Map());
    nodeErrors.set(node, errors);
    try {
      if (node === root) updateFieldNodeGlobalErrors(root);
      else {
        const contributions: ExternalContributions =
          (runtime.externalContributions ??= new Map());
        contributions.set(node, errors);
      }
    } catch (error) {
      runtime.nodeErrors?.delete(node);
      throw error;
    } finally {
      runtime.adoptedExternalErrors?.delete(path);
    }
    queueNonSettleEvent(node, FieldNodeEventType.UpdateError, errors);
  }
  if (!runtime.adoptedExternalErrors?.size)
    runtime.adoptedExternalErrors = undefined;
};
