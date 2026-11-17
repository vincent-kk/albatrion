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
    current.interactionEpoch += 1;
    if (Object.keys(current.storedState).length) {
      const previous = current.storedState;
      recordFieldNodeRevealBaseline(current);
      current.storedState = {};
      accumulateGlobalStateDeltas(
        deltas,
        previous,
        current.storedState,
        previous,
      );
      if (current.deliveryChanges & FieldNodeEventType.UpdateState)
        current.deliveryPreviousState = current.storedState;
      runtime.hasStateChanged = true;
      queueNonSettleEvent(
        current,
        FieldNodeEventType.UpdateState,
        current.storedState,
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
