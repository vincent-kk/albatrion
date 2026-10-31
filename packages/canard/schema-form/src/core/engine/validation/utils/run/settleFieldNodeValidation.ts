import type { FieldNodeRecord } from '../../../record';
import { dropFieldNodeRevealBaselines } from '../lifetime/dropFieldNodeRevealBaselines';

/** End a current write verdict without changing public events or revisions.
 * @param node - Occurrence sharing the pending runtime.
 * @param stamp - Optional current-run guard; omitted for unconditional invalidation.
 * @returns Nothing; already settled or stale runs do not notify. */
export const settleFieldNodeValidation = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  stamp?: number,
): void => {
  const runtime = node.rootNode.runtime;
  if (stamp !== undefined && runtime.validationStamp !== stamp) return;
  if (!runtime.validationPending) {
    if (runtime.validationUnavailable) dropFieldNodeRevealBaselines(node);
    return;
  }
  runtime.validationPending = false;
  dropFieldNodeRevealBaselines(node);
  for (const listener of [...(runtime.validationSettleListeners ?? [])])
    listener();
};
