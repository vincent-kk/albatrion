import { SchemaNodeEventType } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';
import { flushQueuedEvents } from '../chain/flushQueuedEvents';
import { queueNonSettleEvent } from '../chain/queueNonSettleEvent';
import { assertNotInDelivery } from '../report/assertNotInDelivery';

/**
 * Remove a live node's external issues without touching its source.
 * @param node - Occurrence whose external errors are removed
 * @returns Nothing; delivery is synchronous outside a public write
 */
export const dispatchClearExternalErrors = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): void => {
  if (node.detached) return;
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  if (!runtime.nodeErrors?.delete(node)) return;
  queueNonSettleEvent(node, SchemaNodeEventType.UpdateError, []);
  if (!runtime.entryDepth) flushQueuedEvents(node.rootNode);
};
