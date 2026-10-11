import { SchemaNodeEventType, SchemaNodeRevisionLedger } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';
import { walkOwnedSchemaNodes } from '../walkOwnedSchemaNodes';

/**
 * Retire an adopted tree without changing its committed reads or references.
 * @param root - Previous root whose binding listeners must be detached
 * @returns Nothing; counters advance synchronously without event delivery
 */
export const disposeSchemaNodeTree = <Self extends SchemaNodeRecord<Self>>(
  root: Self,
): void => {
  const runtime = root.runtime;
  walkOwnedSchemaNodes(root, (node) => {
    if (node.disposed) return;
    node.disposed = true;
    node.interactionReset += 1;
    node.revisionLedger = new SchemaNodeRevisionLedger(node.revisionLedger,
      SchemaNodeEventType.RequestRefresh);
    node.pendingDelivery = undefined;
    node.pendingRevision = 0;
    node.pendingNonSettleDelivery = undefined;
  });
  for (const subscriptions of runtime.listeners?.values() ?? []) subscriptions.clear();
  runtime.listeners?.clear();
  runtime.validationStamp = (runtime.validationStamp ?? 0) + 1;
  runtime.validationPendingTargets = undefined;
};
