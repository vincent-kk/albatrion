import { patchSchemaNodeInteractionState, SchemaNodeEventType } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';
import type { NodeStateFlags } from '../../../types/state';
import { flushQueuedEvents } from '../chain/flushQueuedEvents';
import { queueNonSettleEvent } from '../chain/queueNonSettleEvent';
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
  const pending = [node];
  while (pending.length) {
    const current = pending.pop();
    if (!current || current.detached) continue;
    const previous = current.state;
    patchSchemaNodeInteractionState(current, state);
    if (previous !== current.state) {
      runtime.stateChanged = true;
      queueNonSettleEvent(current, SchemaNodeEventType.UpdateState, current.state);
    }
    for (const child of current.children ?? []) pending.push(child);
  }
  if (!runtime.entryDepth) flushQueuedEvents(node.rootNode);
};
