import { FieldNodeEventType } from '../../../../record';
import type { FieldNodeRecord } from '../../../../record';
import { ValidationMode } from '../../../../types/state';
import { routeValidationIssues } from '../../../../validation';
import type { ValidationIssue } from '../../../../validation';
import { queueNonSettleEvent } from '../../chain/queueNonSettleEvent';

/** Shared frozen verdict that routes no validator issues. */
const NO_ISSUES: readonly ValidationIssue[] = Object.freeze([]);

/**
 * Clear both error layers at a form reset boundary before loading its value.
 * @param root - Live form root whose error lifetime is ending
 * @returns Nothing; changed occurrences are queued inside the current entry
 */
export const clearFieldNodeFormErrors = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): void => {
  const runtime = root.runtime;
  const rootExternalChanged = runtime.nodeErrors?.delete(root);
  const changed = routeValidationIssues(root, NO_ISSUES);
  if (rootExternalChanged) changed.add(root);
  const pending = [root];
  while (pending.length) {
    const node = pending.pop();
    if (!node) continue;
    if (runtime.nodeErrors?.has(node)) changed.add(node);
    for (const child of node.children ?? [])
      if (child.parent === node) pending.push(child);
  }
  runtime.nodeErrors?.clear();
  runtime.adoptedExternalErrors = undefined;
  runtime.validationResult = undefined;
  runtime.validationListChanged = undefined;
  if (!((runtime.validationMode ?? 0) & ValidationMode.OnChange))
    runtime.validationStamp = (runtime.validationStamp ?? 0) + 1;
  runtime.validationPendingTargets = undefined;
  runtime.validationChangedNodes = undefined;
  for (const node of changed)
    queueNonSettleEvent(node, FieldNodeEventType.UpdateError, []);
  queueNonSettleEvent(root, FieldNodeEventType.UpdateGlobalError, []);
};
