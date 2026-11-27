import { visitFieldNodes } from '../../../navigation';
import {
  advanceFieldNodeRevealSequence,
  queueNonSettleEvent,
} from '../../../record';
import {
  FieldNodeEventType,
  accumulateGlobalStateDeltas,
  publishGlobalStateDeltas,
  recordFieldNodeRevealBaseline,
} from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import { assertFieldNodeWritable } from '../../../settle';
import { scheduleFieldNodeRevealDrop } from '../../../validation';
import { closeNonSettleEntry } from '../chain/closeNonSettleEntry';
import { refuseListenerFeedback } from '../chain/refuseListenerFeedback';
import { assertNotInDelivery } from '../report/assertNotInDelivery';

/**
 * Clear interaction flags on every live occurrence in a subtree.
 * @param node - Root of the affected subtree
 * @returns Nothing; one wave follows the whole traversal outside an entry
 */
export const dispatchClearSubtreeState = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): void => {
  assertFieldNodeWritable(node);
  if (node.isDetached) return;
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  if (refuseListenerFeedback(runtime)) return;
  advanceFieldNodeRevealSequence(node);
  const deltas = new Map<string, number>();
  visitFieldNodes(node, (current) => {
    if (current.isDetached) return false;
    current.__interactionEpoch__ += 1;
    if (Object.keys(current.__state__).length) {
      const previous = current.__state__;
      recordFieldNodeRevealBaseline(current);
      current.__state__ = {};
      accumulateGlobalStateDeltas(
        deltas,
        previous,
        current.__state__,
        previous,
      );
      if (current.__deliveryChanges__ & FieldNodeEventType.UpdateState)
        current.__deliveryPreviousState__ = current.__state__;
      runtime.hasStateChanged = true;
      queueNonSettleEvent(
        current,
        FieldNodeEventType.UpdateState,
        current.__state__,
      );
    }
    return true;
  });
  publishGlobalStateDeltas(node.rootNode, deltas);
  try {
    closeNonSettleEntry(node);
  } finally {
    if (!runtime.entryDepth) scheduleFieldNodeRevealDrop(node);
  }
};
