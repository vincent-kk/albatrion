import { FormErrorCode, SchemaFormError } from '../../../../../errors';
import type { FieldNodeRuntime } from '../../../record';
import { captureChainError } from './captureChainError';

/**
 * Refuse a listener write after the outer chain has delivered 25 feedback waves.
 * @param runtime - Live root runtime of the attempted write
 * @returns Whether the caller must skip the entire write without entering a chain
 */
export const refuseListenerFeedback = <Self>(
  runtime: FieldNodeRuntime<Self>,
): boolean => {
  if (
    !runtime.entryDepth ||
    !runtime.currentListener ||
    (runtime.feedbackBudget ?? 0) < 25
  )
    return false;
  (runtime.feedbackBlockedListeners ??= new Set()).add(runtime.currentListener);
  if (!runtime.feedbackLimitReported) {
    captureChainError(
      runtime,
      new SchemaFormError(
        FormErrorCode.FeedbackLimitExceeded,
        'Listener feedback exceeded 25 waves',
      ),
    );
    runtime.feedbackLimitReported = true;
  }
  return true;
};
