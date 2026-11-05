import { FormErrorCode } from '../../../../../errors';
import type { FieldNodeRecord } from '../../../record';
import { ValidationMode } from '../../../types/state';
import {
  assertValidationRootReady,
  failValidationCompile,
  hasFieldNodeValidationRequest,
  isFieldNodeValidationCurrent,
  isFieldNodeValidationLifetimeCurrent,
} from '../../../validation';
import { ensureValidationFailureReporter } from '../report/ensureValidationFailureReporter';
import { reportMissingValidator } from '../report/reportMissingValidator';

/** Single load-validation entry, called by the binding's slot after the next frame.
 * @param root - Current load root; None and unavailable loads perform no work.
 * @returns Whether OnChange still owes a verdict after whole-schema preparation.
 * Failures use the automatic sink without opening a write chain. */
export const dispatchLoadValidation = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): boolean => {
  const runtime = root.runtime;
  if (
    runtime.validationMode === ValidationMode.None ||
    runtime.validationUnavailable
  )
    return false;
  const load = runtime.validationLoadStamp;
  const epoch = runtime.validationEpoch;
  const stamp = runtime.validationStamp;
  const commit = runtime.commitNumber ?? 0;
  ensureValidationFailureReporter(runtime);
  reportMissingValidator(root);
  if (!isFieldNodeValidationCurrent(root, load, epoch, stamp, commit))
    return false;
  try {
    if (!assertValidationRootReady(root)) return false;
  } catch (failure) {
    if (!isFieldNodeValidationLifetimeCurrent(root, epoch)) return false;
    if (
      failure !== null &&
      typeof failure === 'object' &&
      'code' in failure &&
      failure.code === FormErrorCode.ValidatorCompileFailed
    )
      failValidationCompile(root, failure);
    else runtime.reportValidationFailure?.(failure);
    return false;
  }
  return (
    isFieldNodeValidationCurrent(root, load, epoch, stamp, commit) &&
    ((runtime.validationMode ?? 0) & ValidationMode.OnChange) !== 0 &&
    !hasFieldNodeValidationRequest(root)
  );
};
