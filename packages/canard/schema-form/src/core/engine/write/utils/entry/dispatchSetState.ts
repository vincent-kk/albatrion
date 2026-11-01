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
 * Patch a live occurrence's interaction flags without settling its source.
 * @param node - Occurrence whose local state is changed
 * @param state - Own-key flags to merge with the current state
 * @returns Nothing; delivery is synchronous outside a public write
 */
export const dispatchSetState = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  state: NodeStateFlags,
): void => {
  assertFieldNodeWritable(node);
  if (node.detached) return;
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  if (refuseListenerFeedback(runtime)) return;
  advanceFieldNodeRevealSequence(node);
  const previous = node.interactionState;
  patchFieldNodeInteractionState(node, state);
  if (previous === node.interactionState) return;
  const deltas = new Map<string, number>();
  accumulateGlobalStateDeltas(deltas, previous, node.interactionState, state);
  publishGlobalStateDeltas(node.rootNode, deltas);
  if (node.deliveryChanges & FieldNodeEventType.UpdateState)
    node.deliveryPreviousState = node.interactionState;
  runtime.stateChanged = true;
  queueNonSettleEvent(
    node,
    FieldNodeEventType.UpdateState,
    node.interactionState,
  );
  try {
    closeNonSettleEntry(node);
  } finally {
    if (!runtime.entryDepth) scheduleFieldNodeRevealDrop(node);
  }
};
