import { accumulateGlobalStateDeltas, patchSchemaNodeInteractionState,
  publishGlobalStateDeltas, SchemaNodeEventType } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';
import type { NodeStateFlags } from '../../../types/state';
import { flushQueuedEvents } from '../chain/flushQueuedEvents';
import { queueNonSettleEvent } from '../chain/queueNonSettleEvent';
import { refuseListenerFeedback } from '../chain/refuseListenerFeedback';
import { assertNotInDelivery } from '../report/assertNotInDelivery';

/**
 * Patch interaction flags on every live occurrence in a subtree.
 * @param node - Root of the affected subtree
 * @param state - Own-key flags applied to each occurrence
 * @returns Nothing; one wave follows the whole traversal outside an entry
 */
export const dispatchSetSubtreeState = <Self extends SchemaNodeRecord<Self>>(
  node: Self, state: NodeStateFlags,
): void => {
  if (node.detached) return;
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  if (refuseListenerFeedback(runtime)) return;
  const deltas = new Map<string, number>();
  const pending = [node];
  while (pending.length) {
    const current = pending.pop();
    if (!current || current.detached) continue;
    const previous = current.interactionState;
    patchSchemaNodeInteractionState(current, state);
    if (previous !== current.interactionState) {
      accumulateGlobalStateDeltas(deltas, previous, current.interactionState, state);
      const snapshot = current.deliveryBaseline;
      if (snapshot) snapshot.interactionState = current.interactionState;
      runtime.stateChanged = true;
      queueNonSettleEvent(current, SchemaNodeEventType.UpdateState,
        current.interactionState);
    }
    for (const child of current.children ?? []) pending.push(child);
  }
  publishGlobalStateDeltas(node.rootNode, deltas);
  if (!runtime.entryDepth) flushQueuedEvents(node.rootNode);
};
