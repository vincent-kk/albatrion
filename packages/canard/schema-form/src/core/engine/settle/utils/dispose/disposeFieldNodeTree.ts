import { visitFieldNodes } from '../../../navigation';
import { FieldNodeEventType, FieldNodeRevisionLedger } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import { clearTreeMemoStores } from '../../../utils/cache/clearTreeMemoStores';
import {
  releaseFieldNodeRevealHistory,
  settleFieldNodeValidation,
} from '../../../validation';

/**
 * Retire an adopted tree without changing its committed reads or references.
 * @param root - Previous root whose binding listeners must be detached
 * @returns Nothing; counters advance synchronously without event delivery
 */
export const disposeFieldNodeTree = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): void => {
  const runtime = root.runtime;
  runtime.validationCadence?.cancel();
  runtime.validationCadence = undefined;
  runtime.validationRun = undefined;
  runtime.revealReleaseListeners?.clear();
  settleFieldNodeValidation(root);
  releaseFieldNodeRevealHistory(root);
  runtime.revealPolicy = undefined;
  runtime.validationPendingEntryStamp = undefined;
  visitFieldNodes(
    root,
    (node) => {
      if (node.disposed) return;
      node.disposed = true;
      node.interactionReset += 1;
      node.revisionLedger = new FieldNodeRevisionLedger(
        node.revisionLedger,
        FieldNodeEventType.RequestRefresh,
      );
      node.pendingDelivery = undefined;
      node.pendingRevision = 0;
      node.pendingNonSettleDelivery = undefined;
    },
    { owned: true },
  );
  for (const subscriptions of runtime.listeners?.values() ?? [])
    subscriptions.clear();
  runtime.listeners?.clear();
  for (const subscriptions of runtime.inactiveListeners?.values() ?? [])
    subscriptions.clear();
  runtime.inactiveListeners?.clear();
  clearTreeMemoStores(runtime);
  runtime.validationStamp = (runtime.validationStamp ?? 0) + 1;
  runtime.validationPendingTargets = undefined;
};
