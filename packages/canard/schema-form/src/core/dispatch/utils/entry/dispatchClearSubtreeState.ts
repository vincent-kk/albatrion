import { accumulateGlobalStateDeltas, publishGlobalStateDeltas,
  SchemaNodeEventType } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';
import { flushQueuedEvents } from '../chain/flushQueuedEvents';
import { queueNonSettleEvent } from '../chain/queueNonSettleEvent';
import { refuseListenerFeedback } from '../chain/refuseListenerFeedback';
import { assertNotInDelivery } from '../report/assertNotInDelivery';

/**
 * Clear interaction flags on every live occurrence in a subtree.
 * @param node - Root of the affected subtree
 * @returns Nothing; one wave follows the whole traversal outside an entry
 */
export const dispatchClearSubtreeState = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
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
    if (Object.keys(current.interactionState).length) {
      const previous = current.interactionState;
      current.interactionState = {};
      accumulateGlobalStateDeltas(deltas, previous, current.interactionState, previous);
      const snapshot = runtime.deliverySnapshots?.get(current);
      if (snapshot) runtime.deliverySnapshots?.set(current, {
        ...snapshot, interactionState: current.interactionState,
      });
      runtime.stateChanged = true;
      queueNonSettleEvent(current, SchemaNodeEventType.UpdateState,
        current.interactionState);
    }
    for (const child of current.children ?? []) pending.push(child);
  }
  publishGlobalStateDeltas(node.rootNode, deltas);
  if (!runtime.entryDepth) flushQueuedEvents(node.rootNode);
};
