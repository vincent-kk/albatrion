import { SchemaNodeEventType } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';
import { assertSchemaNodeWritable } from '../../../settle';
import type { ValidationIssue } from '../../../validation';
import { updateSchemaNodeGlobalErrors } from '../../../validation';
import { flushQueuedEvents } from '../chain/flushQueuedEvents';
import { queueNonSettleEvent } from '../chain/queueNonSettleEvent';
import { refuseListenerFeedback } from '../chain/refuseListenerFeedback';
import { assertNotInDelivery } from '../report/assertNotInDelivery';

/**
 * Replace a live node's external issues without changing its source.
 * @param node - Occurrence receiving external validation issues
 * @param errors - Ordered issues retained by reference in the tree runtime
 * @returns Nothing; delivery is synchronous outside a public write
 */
export const dispatchSetExternalErrors = <Self extends SchemaNodeRecord<Self>>(
  node: Self, errors: readonly ValidationIssue[],
): void => {
  assertSchemaNodeWritable(node);
  if (node.detached) return;
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  if (refuseListenerFeedback(runtime)) return;
  if (runtime.nodeErrors?.get(node) === errors) return;
  (runtime.nodeErrors ??= new Map()).set(node, errors);
  if (node === node.rootNode) updateSchemaNodeGlobalErrors(node);
  queueNonSettleEvent(node, SchemaNodeEventType.UpdateError, errors);
  if (!runtime.entryDepth) flushQueuedEvents(node.rootNode);
};
