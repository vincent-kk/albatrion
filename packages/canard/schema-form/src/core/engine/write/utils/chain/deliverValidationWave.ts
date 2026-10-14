import { FieldNodeEventType } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import type { ValidationIssue } from '../../../validation';
import { flushQueuedEvents } from './flushQueuedEvents';
import { queueNonSettleEvent } from './queueNonSettleEvent';

/**
 * Publish a stamped validation result through one separate non-settlement wave.
 * The form-level error event goes out only when routing replaced the routed list.
 * @param node - Scope whose validator issues were routed.
 * @param issues - Whole-schema issues retained by the validation layer.
 * @param commit - Commit stamped before asynchronous execution.
 * @returns Nothing; subscriber failures are exposed by the dispatcher sink.
 */
export const deliverValidationWave = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  issues: readonly ValidationIssue[],
  commit: number,
): void => {
  const runtime = node.rootNode.runtime;
  if ((runtime.commitNumber ?? 0) !== commit) return;
  for (const changed of runtime.validationChangedNodes ?? [])
    queueNonSettleEvent(
      changed,
      FieldNodeEventType.UpdateError,
      runtime.validationErrors?.get(changed) ?? [],
    );
  runtime.validationChangedNodes = undefined;
  if (runtime.validationListChanged)
    queueNonSettleEvent(
      node.rootNode,
      FieldNodeEventType.UpdateGlobalError,
      issues,
    );
  runtime.validationListChanged = undefined;
  flushQueuedEvents(node.rootNode, false);
};
