import type { SchemaNodeRecord } from '../../../record';
import { assertNotInDelivery } from '../report/assertNotInDelivery';
import { refuseListenerFeedback } from './refuseListenerFeedback';

/**
 * Enter one public write on the tree shared by a record.
 * @param node - Target whose live root owns the chain
 * @returns Whether the write entered; refused feedback leaves depth unchanged
 */
export const enterSchemaNodeChain = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): boolean => {
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  if (!runtime.entryDepth) {
    runtime.enclosingChain = runtime.chainErrors && runtime.chainOccurrences ?
      { errors: runtime.chainErrors, occurrences: runtime.chainOccurrences,
        outer: runtime.enclosingChain } : undefined;
    runtime.chainRoot = node.rootNode;
    runtime.chainInitialEmit = node.rootNode.emit;
    runtime.chainErrors = [];
    runtime.chainOccurrences = [];
    runtime.feedbackBudget = 0;
    runtime.feedbackBlockedListeners = undefined;
    runtime.feedbackLimitReported = false;
  }
  if (refuseListenerFeedback(runtime)) return false;
  runtime.entryDepth = (runtime.entryDepth ?? 0) + 1;
  return true;
};
