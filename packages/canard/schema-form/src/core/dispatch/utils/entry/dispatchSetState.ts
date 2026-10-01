import { accumulateGlobalStateDeltas, patchSchemaNodeInteractionState,
  publishGlobalStateDeltas, SchemaNodeEventType } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';
import type { NodeStateFlags } from '../../../types/state';
import { flushQueuedEvents } from '../chain/flushQueuedEvents';
import { queueNonSettleEvent } from '../chain/queueNonSettleEvent';
import { assertNotInDelivery } from '../report/assertNotInDelivery';

/**
 * Patch a live occurrence's interaction flags without settling its source.
 * @param node - Occurrence whose local state is changed
 * @param state - Own-key flags to merge with the current state
 * @returns Nothing; delivery is synchronous outside a public write
 */
export const dispatchSetState = <Self extends SchemaNodeRecord<Self>>(
  node: Self, state: NodeStateFlags,
): void => {
  if (node.detached) return;
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  const previous = node.interactionState;
  patchSchemaNodeInteractionState(node, state);
  if (previous === node.interactionState) return;
  const deltas = new Map<string, number>();
  accumulateGlobalStateDeltas(deltas, previous, node.interactionState, state);
  publishGlobalStateDeltas(node.rootNode, deltas);
  const snapshot = runtime.deliverySnapshots?.get(node);
  if (snapshot) runtime.deliverySnapshots?.set(node, {
    ...snapshot, interactionState: node.interactionState,
  });
  runtime.stateChanged = true;
  queueNonSettleEvent(node, SchemaNodeEventType.UpdateState, node.interactionState);
  if (!runtime.entryDepth) flushQueuedEvents(node.rootNode);
};
