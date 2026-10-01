import type { SchemaNodeRecord } from '../../../record';

/**
 * Transfer an open entry to a rebuilt root before its outer call completes.
 * @param previousRoot - Root being retired by the binding
 * @param nextRoot - Replacement with the same authored form lifetime
 * @returns Nothing; the replacement runtime owns pending chain state
 */
export const adoptSchemaNodeChain = <Self extends SchemaNodeRecord<Self>>(
  previousRoot: Self, nextRoot: Self,
): void => {
  const previous = previousRoot.runtime;
  const next = nextRoot.runtime;
  next.entryDepth = previous.entryDepth;
  next.chainRoot = nextRoot;
  next.chainInitialEmit = previous.chainInitialEmit;
  next.chainErrors = previous.chainErrors;
  next.feedbackBudget = previous.feedbackBudget;
  next.feedbackBlockedListeners = previous.feedbackBlockedListeners;
  next.feedbackLimitReported = previous.feedbackLimitReported;
  next.currentListener = previous.currentListener;
  next.onChangeBudget = previous.onChangeBudget;
  next.batchDepth = previous.batchDepth;
  next.batchWrites = previous.batchWrites;
  next.validationTargets = previous.validationTargets;
  next.deliveries = previous.deliveries;
  previous.adoptedRoot = nextRoot;
  previous.entryDepth = 0;
  previous.batchDepth = 0;
  previous.batchWrites = undefined;
  previous.deliveries = undefined;
};
