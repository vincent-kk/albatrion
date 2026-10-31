import { visitFieldNodes } from '../../../navigation';
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
import { queueNonSettleEvent } from '../chain/queueNonSettleEvent';
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
  if (node.detached) return;
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  if (refuseListenerFeedback(runtime)) return;
  const deltas = new Map<string, number>();
  visitFieldNodes(node, (current) => {
    if (current.detached) return false;
    current.interactionReset += 1;
    if (Object.keys(current.interactionState).length) {
      const previous = current.interactionState;
      recordFieldNodeRevealBaseline(current);
      current.interactionState = {};
      accumulateGlobalStateDeltas(
        deltas,
        previous,
        current.interactionState,
        previous,
      );
      if (current.deliveryChanges & FieldNodeEventType.UpdateState)
        current.deliveryPreviousState = current.interactionState;
      runtime.stateChanged = true;
      queueNonSettleEvent(
        current,
        FieldNodeEventType.UpdateState,
        current.interactionState,
      );
    }
    return true;
  });
  publishGlobalStateDeltas(node.rootNode, deltas);
  closeNonSettleEntry(node);
  if (!runtime.entryDepth) scheduleFieldNodeRevealDrop(node);
};
