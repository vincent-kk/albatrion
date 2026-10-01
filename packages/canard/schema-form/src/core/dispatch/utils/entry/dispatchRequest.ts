import { SchemaNodeRequestType } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';
import { flushQueuedEvents } from '../chain/flushQueuedEvents';
import { queueNonSettleEvent } from '../chain/queueNonSettleEvent';
import { assertNotInDelivery } from '../report/assertNotInDelivery';

/**
 * Deliver one renderer command without opening a value-write entry.
 * @param node - Live occurrence addressed by the command
 * @param kind - One supported request bit, never an OR-ed combination
 * @returns Nothing; delivery is synchronous outside a public write
 */
export const dispatchRequest = <Self extends SchemaNodeRecord<Self>>(
  node: Self, kind: SchemaNodeRequestType,
): void => {
  if (node.detached) return;
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  if (kind !== SchemaNodeRequestType.Focus &&
    kind !== SchemaNodeRequestType.Select &&
    kind !== SchemaNodeRequestType.Refresh &&
    kind !== SchemaNodeRequestType.Remount) return;
  queueNonSettleEvent(node, kind);
  if (!runtime.entryDepth) flushQueuedEvents(node.rootNode);
};
