import { visitFieldNodes } from '../../../navigation';
import { advanceFieldNodeRevealSequence } from '../../../record';
import {
  FieldNodeEventType,
  accumulateGlobalStateDeltas,
  patchFieldNodeInteractionState,
  publishGlobalStateDeltas,
} from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import { assertFieldNodeWritable } from '../../../settle';
import type { NodeStateFlags } from '../../../types/state';
import { scheduleFieldNodeRevealDrop } from '../../../validation';
import { closeNonSettleEntry } from '../chain/closeNonSettleEntry';
import { queueNonSettleEvent } from '../chain/queueNonSettleEvent';
import { refuseListenerFeedback } from '../chain/refuseListenerFeedback';
import { assertNotInDelivery } from '../report/assertNotInDelivery';

/**
 * Patch interaction flags on every live occurrence in a subtree.
 * @param node - Root of the affected subtree
 * @param state - Own-key flags applied to each occurrence
 * @returns Nothing; one wave follows the whole traversal outside an entry
 */
export const dispatchSetSubtreeState = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  state: NodeStateFlags,
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
    const previous = current.storedState;
    patchFieldNodeInteractionState(current, state);
    if (previous !== current.storedState) {
      accumulateGlobalStateDeltas(deltas, previous, current.storedState, state);
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
