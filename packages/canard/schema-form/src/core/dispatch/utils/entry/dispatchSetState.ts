import { patchSchemaNodeInteractionState, SchemaNodeEventType } from '../../../record';
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
  const previous = node.state;
  patchSchemaNodeInteractionState(node, state);
  if (previous === node.state) return;
  runtime.stateChanged = true;
  queueNonSettleEvent(node, SchemaNodeEventType.UpdateState, node.state);
  if (!runtime.entryDepth) flushQueuedEvents(node.rootNode);
};
