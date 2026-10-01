import { FEEDBACK_LIMIT_EXCEEDED, SchemaFormError } from '../../../../errors';
import type { SchemaNodeRecord } from '../../../record';

/**
 * Enter one public write on the tree shared by a record.
 * @param node - Target whose live root owns the chain
 * @returns Nothing; the runtime depth holds the active stack
 */
export const enterSchemaNodeChain = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): void => {
  const runtime = node.rootNode.runtime;
  if (!runtime.entryDepth) {
    runtime.chainRoot = node.rootNode;
    runtime.chainInitialEmit = node.rootNode.emit;
    runtime.chainErrors = [];
    runtime.feedbackBudget = 0;
    runtime.feedbackBlockedListeners = undefined;
    runtime.feedbackLimitReported = false;
  }
  if (runtime.currentListener && (runtime.feedbackBudget ?? 0) >= 25) {
    (runtime.feedbackBlockedListeners ??= new Set()).add(runtime.currentListener);
    if (!runtime.feedbackLimitReported) {
      runtime.chainErrors?.push(new SchemaFormError(FEEDBACK_LIMIT_EXCEEDED,
        'Listener feedback exceeded 25 waves'));
      runtime.feedbackLimitReported = true;
    }
  }
  runtime.entryDepth = (runtime.entryDepth ?? 0) + 1;
};
