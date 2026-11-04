import type { FieldNodeRecord } from '../../../record';

/**
 * Open the outermost entry state on a tree, keeping any standalone delivery's lists as its enclosure.
 * @param root - Live root whose runtime starts the chain
 * @param origin - Operation opening a chain without an enclosing collector
 * @returns Nothing; the runtime holds fresh chain errors, occurrences and feedback budget
 */
export const startFieldNodeChain = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  origin: 'load' | 'write',
): void => {
  const runtime = root.runtime;
  runtime.enclosingChain =
    runtime.chainErrors && runtime.chainOccurrences
      ? {
          errors: runtime.chainErrors,
          occurrences: runtime.chainOccurrences,
          outer: runtime.enclosingChain,
        }
      : undefined;
  if (!runtime.enclosingChain) runtime.chainOrigin = origin;
  runtime.chainRoot = root;
  runtime.chainInitialEmit = root.emit;
  runtime.chainErrors = [];
  runtime.chainOccurrences = [];
  runtime.feedbackBudget = 0;
  runtime.feedbackBlockedListeners = undefined;
  runtime.feedbackLimitReported = false;
};
