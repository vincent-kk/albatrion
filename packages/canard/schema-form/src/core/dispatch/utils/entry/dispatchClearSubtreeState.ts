import { SchemaNodeEventType } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';
import { flushQueuedEvents } from '../chain/flushQueuedEvents';
import { queueNonSettleEvent } from '../chain/queueNonSettleEvent';
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
  const pending = [node];
  while (pending.length) {
    const current = pending.pop();
    if (!current || current.detached) continue;
    if (Object.keys(current.state).length) {
      current.state = {};
      runtime.stateChanged = true;
      queueNonSettleEvent(current, SchemaNodeEventType.UpdateState, current.state);
    }
    for (const child of current.children ?? []) pending.push(child);
  }
  if (!runtime.entryDepth) flushQueuedEvents(node.rootNode);
};
