import { FieldNodeEventType, queueNonSettleEvent } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import { assertFieldNodeWritable } from '../../../settle';
import type { ValidationIssue } from '../../../validation';
import { closeNonSettleEntry } from '../chain/closeNonSettleEntry';
import { refuseListenerFeedback } from '../chain/refuseListenerFeedback';
import { assertNotInDelivery } from '../report/assertNotInDelivery';
import { propagateExternalErrorsToRoot } from './utils/propagateExternalErrorsToRoot';
import { publishRootExternalErrors } from './utils/publishRootExternalErrors';

/** Annotates the lazily created `nodeErrors`; an argument-less `new Map()` would be `Map<any, any>`. */
type NodeErrors = Map<unknown, readonly { dataPath: string }[]>;

/**
 * Replace a live node's external issues without changing its source.
 * @param node - Occurrence receiving external validation issues
 * @param errors - Ordered issues retained by reference in the tree runtime
 * @returns Nothing; delivery is synchronous outside a public write
 */
export const dispatchSetExternalErrors = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  errors: readonly ValidationIssue[],
): void => {
  assertFieldNodeWritable(node);
  if (node.isDetached) return;
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  if (refuseListenerFeedback(runtime)) return;
  if (runtime.nodeErrors?.get(node) === errors) return;
  const nodeErrors: NodeErrors = (runtime.nodeErrors ??= new Map());
  nodeErrors.set(node, errors);
  if (node === node.rootNode) publishRootExternalErrors(node);
  else propagateExternalErrorsToRoot(node);
  queueNonSettleEvent(node, FieldNodeEventType.UpdateError, errors);
  closeNonSettleEntry(node);
};
