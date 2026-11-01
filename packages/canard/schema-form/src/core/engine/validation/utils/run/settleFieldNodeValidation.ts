import type { FieldNodeRecord } from '../../../record';
import { releaseFieldNodeRevealHistory } from '../lifetime/releaseFieldNodeRevealHistory';

/** End a current write verdict without changing public events or revisions.
 * @param node - Occurrence sharing the pending runtime.
 * @param stamp - Optional current-run guard; omitted for unconditional invalidation.
 * @returns Nothing; stale runs do not release, and unavailable validation also releases retained history. */
export const settleFieldNodeValidation = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  stamp?: number,
): void => {
  const runtime = node.rootNode.runtime;
  if (stamp !== undefined && runtime.validationStamp !== stamp) return;
  if (!runtime.validationPending) {
    if (runtime.validationUnavailable) releaseFieldNodeRevealHistory(node);
    return;
  }
  runtime.validationPending = false;
  releaseFieldNodeRevealHistory(node);
};
