import { SchemaNodeEventType } from '../../../../record';
import type { SchemaNodeRecord } from '../../../../record';
import { routeValidationIssues } from '../../../../validation';
import { ValidationMode } from '../../../../types/state';
import { queueNonSettleEvent } from '../../chain/queueNonSettleEvent';

/**
 * Clear both error layers at a form reset boundary before loading its value.
 * @param root - Live form root whose error lifetime is ending
 * @returns Nothing; changed occurrences are queued inside the current entry
 */
export const clearSchemaNodeFormErrors = <Self extends SchemaNodeRecord<Self>>(
  root: Self,
): void => {
  const runtime = root.runtime;
  const changed = routeValidationIssues(root, []);
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
  if (!((runtime.validationMode ?? 0) & ValidationMode.OnChange))
    runtime.validationStamp = (runtime.validationStamp ?? 0) + 1;
  runtime.validationPendingTargets = undefined;
  runtime.validationChangedNodes = undefined;
  for (const node of changed)
    queueNonSettleEvent(node, SchemaNodeEventType.UpdateError, []);
  queueNonSettleEvent(root, SchemaNodeEventType.UpdateGlobalError, []);
};
