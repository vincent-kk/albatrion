import { SchemaNodeEventType } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';
import type { ValidationIssue } from '../../../validation';
import { flushQueuedEvents } from './flushQueuedEvents';
import { queueNonSettleEvent } from './queueNonSettleEvent';

/**
 * Publish a stamped validation result through one separate non-settlement wave.
 * @param node - Scope whose validator issues were routed.
 * @param issues - Whole-schema issues retained by the validation layer.
 * @param commit - Commit stamped before asynchronous execution.
 * @returns Nothing; subscriber failures are exposed by the dispatcher sink.
 */
export const deliverValidationWave = <Self extends SchemaNodeRecord<Self>>(
  node: Self, issues: readonly ValidationIssue[], commit: number,
): void => {
  const runtime = node.rootNode.runtime;
  if ((runtime.commitNumber ?? 0) !== commit) return;
  for (const changed of runtime.validationChangedNodes ?? [])
    queueNonSettleEvent(changed, SchemaNodeEventType.UpdateError,
      runtime.validationErrors?.get(changed) ?? []);
  runtime.validationChangedNodes = undefined;
  queueNonSettleEvent(node.rootNode, SchemaNodeEventType.UpdateGlobalError, issues);
  flushQueuedEvents(node.rootNode);
};
