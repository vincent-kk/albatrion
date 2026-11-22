import {
  advanceFieldNodeRevealSequence,
  queueNonSettleEvent,
} from '../../../record';
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
  if (node.isDetached) return;
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  if (refuseListenerFeedback(runtime)) return;
  advanceFieldNodeRevealSequence(node);
  const previous = node.storedState;
  patchFieldNodeInteractionState(node, state);
  if (previous === node.storedState) return;
  const deltas = new Map<string, number>();
  accumulateGlobalStateDeltas(deltas, previous, node.storedState, state);
  publishGlobalStateDeltas(node.rootNode, deltas);
  if (node.deliveryChanges & FieldNodeEventType.UpdateState)
    node.deliveryPreviousState = node.storedState;
  runtime.hasStateChanged = true;
  queueNonSettleEvent(node, FieldNodeEventType.UpdateState, node.storedState);
  try {
    closeNonSettleEntry(node);
  } finally {
    if (!runtime.entryDepth) scheduleFieldNodeRevealDrop(node);
  }
};
