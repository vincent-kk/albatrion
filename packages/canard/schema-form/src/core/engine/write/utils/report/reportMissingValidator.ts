import { FormWarningCode } from '../../../../../errors';
import type { FieldNodeRecord } from '../../../record';
import { reportOwnerlessFailure } from './reportOwnerlessFailure';

/**
 * Report first activation of a guard-free tree built with validation disabled.
 * @param root - Current root whose existing warning keys prevent repeated mode-toggle reports.
 * @returns Nothing; handler failures keep the existing ownerless failure surface.
 */
export const reportMissingValidator = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): void => {
  const runtime = root.runtime;
  if (
    runtime.validator ||
    !runtime.errorReporter?.hasConsumer() ||
    runtime.warningKeys?.has(FormWarningCode.ValidatorMissing)
  )
    return;
  (runtime.warningKeys ??= new Set()).add(FormWarningCode.ValidatorMissing);
  try {
    runtime.errorReporter.report({
      level: 'warning',
      code: FormWarningCode.ValidatorMissing,
      message: 'Validation is disabled because no validator was selected',
      origin: 'validate',
    });
  } catch (failure) {
    reportOwnerlessFailure(failure);
  }
};
