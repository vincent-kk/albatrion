import { BIT_MASK_NONE } from '@/schema-form/constants/bitmask';

import { visitFieldNodes } from '../../../navigation';
import { FieldNodeEventType, FieldNodeRevisionLedger } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import {
  releaseFieldNodeRevealHistory,
  settleFieldNodeValidation,
} from '../../../validation';
import { clearFieldNodeMemos } from '../reset/clearFieldNodeMemos';

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
  runtime.runValidation = undefined;
  runtime.activeValidationRun = undefined;
  runtime.revealReleaseListeners?.clear();
  settleFieldNodeValidation(root);
  releaseFieldNodeRevealHistory(root);
  runtime.revealPolicy = undefined;
  runtime.validationPendingEntryStamp = undefined;
  visitFieldNodes(
    root,
    (node) => {
      clearFieldNodeMemos(node);
      if (node.isDisposed) return;
      node.isDisposed = true;
      node.__interactionEpoch__ += 1;
      node.__revisionLedger__ = new FieldNodeRevisionLedger(
        node.__revisionLedger__,
        FieldNodeEventType.RequestRefresh,
      );
      node.__pendingDelivery__ = undefined;
      node.__pendingRevisionMask__ = BIT_MASK_NONE;
      node.__pendingNonSettleDelivery__ = undefined;
    },
    { isOwned: true },
  );
  for (const subscriptions of runtime.listeners?.values() ?? [])
    subscriptions.clear();
  runtime.listeners?.clear();
  for (const subscriptions of runtime.inactiveListeners?.values() ?? [])
    subscriptions.clear();
  runtime.inactiveListeners?.clear();
  runtime.validationStamp = (runtime.validationStamp ?? 0) + 1;
  runtime.validationPendingTargets = undefined;
};
