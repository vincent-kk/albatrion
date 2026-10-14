import type { FieldNodeRecord } from '../../../record';
import { assertFieldNodeWritable } from '../../../settle';
import { assertNotInDelivery } from '../report/assertNotInDelivery';
import { refuseListenerFeedback } from './refuseListenerFeedback';

/**
 * Enter one public write on the tree shared by a record.
 * Inside a `visitSubtree` walk with no batch open, the first write also opens
 * a batch that the walk closes, so later writes are only marked.
 * @param node - Target whose live root owns the chain
 * @returns Whether the write entered; refused feedback leaves depth unchanged
 */
export const enterFieldNodeChain = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): boolean => {
  assertFieldNodeWritable(node);
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  if (!runtime.entryDepth) {
    runtime.enclosingChain =
      runtime.chainErrors && runtime.chainOccurrences
        ? {
            errors: runtime.chainErrors,
            occurrences: runtime.chainOccurrences,
            outer: runtime.enclosingChain,
          }
        : undefined;
    runtime.chainRoot = node.rootNode;
    runtime.chainInitialEmit = node.rootNode.emit;
    runtime.chainErrors = [];
    runtime.chainOccurrences = [];
    runtime.feedbackBudget = 0;
    runtime.feedbackBlockedListeners = undefined;
    runtime.feedbackLimitReported = false;
  }
  if (refuseListenerFeedback(runtime)) return false;
  if (runtime.visitDepth && !runtime.batchDepth) {
    runtime.entryDepth = (runtime.entryDepth ?? 0) + 1;
    runtime.batchDepth = 1;
    runtime.visitBatchEntry = node;
  }
  runtime.entryDepth = (runtime.entryDepth ?? 0) + 1;
  return true;
};
