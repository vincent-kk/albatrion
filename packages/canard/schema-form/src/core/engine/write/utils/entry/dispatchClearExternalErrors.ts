import { FieldNodeEventType } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import { assertFieldNodeWritable } from '../../../settle';
import type { ValidationIssue } from '../../../validation';
import { closeNonSettleEntry } from '../chain/closeNonSettleEntry';
import { queueNonSettleEvent } from '../chain/queueNonSettleEvent';
import { refuseListenerFeedback } from '../chain/refuseListenerFeedback';
import { assertNotInDelivery } from '../report/assertNotInDelivery';
import { propagateExternalErrorsToRoot } from './utils/propagateExternalErrorsToRoot';
import { publishRootExternalErrors } from './utils/publishRootExternalErrors';

/** Shared empty payload for a cleared node; the root list is rebuilt without this path. */
const NO_ISSUES: readonly ValidationIssue[] = [];

/**
 * Remove a live node's external issues without touching its source.
 * @param node - Occurrence whose external errors are removed
 * @returns Nothing; delivery is synchronous outside a public write
 */
export const dispatchClearExternalErrors = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): void => {
  assertFieldNodeWritable(node);
  if (node.detached) return;
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  if (refuseListenerFeedback(runtime)) return;
  if (!runtime.nodeErrors?.delete(node)) return;
  if (node === node.rootNode) publishRootExternalErrors(node);
  else propagateExternalErrorsToRoot(node);
  queueNonSettleEvent(node, FieldNodeEventType.UpdateError, NO_ISSUES);
  closeNonSettleEntry(node);
};
