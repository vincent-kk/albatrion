import { SchemaNodeEventType } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';
import { assertSchemaNodeWritable } from '../../../settle';
import type { ValidationIssue } from '../../../validation';
import { updateSchemaNodeGlobalErrors } from '../../../validation';
import { flushQueuedEvents } from '../chain/flushQueuedEvents';
import { queueNonSettleEvent } from '../chain/queueNonSettleEvent';
import { refuseListenerFeedback } from '../chain/refuseListenerFeedback';
import { assertNotInDelivery } from '../report/assertNotInDelivery';
import { propagateExternalErrorsToRoot } from './utils/propagateExternalErrorsToRoot';

/** Shared empty payload for a cleared node; the root list is rebuilt without this path. */
const NO_ISSUES: readonly ValidationIssue[] = [];

/**
 * Remove a live node's external issues without touching its source.
 * @param node - Occurrence whose external errors are removed
 * @returns Nothing; delivery is synchronous outside a public write
 */
export const dispatchClearExternalErrors = <
  Self extends SchemaNodeRecord<Self>,
>(
  node: Self,
): void => {
  assertSchemaNodeWritable(node);
  if (node.detached) return;
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  if (refuseListenerFeedback(runtime)) return;
  if (!runtime.nodeErrors?.delete(node)) return;
  if (node === node.rootNode) updateSchemaNodeGlobalErrors(node);
  else propagateExternalErrorsToRoot(node.rootNode, node.path, NO_ISSUES);
  queueNonSettleEvent(node, SchemaNodeEventType.UpdateError, NO_ISSUES);
  if (!runtime.entryDepth) flushQueuedEvents(node.rootNode);
};
