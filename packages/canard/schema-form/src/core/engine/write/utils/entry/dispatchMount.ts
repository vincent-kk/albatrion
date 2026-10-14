import { FormWarningCode } from '../../../../../errors';
import type { FormErrorRecord } from '../../../../../errors';
import type { FieldNodeRecord } from '../../../record';
import { loadFieldNodeAtMount } from '../../../settle';
import { ValidationMode } from '../../../types/state';
import { WriteOption } from '../../../types/value';
import { captureChainError } from '../chain/captureChainError';
import { enterFieldNodeChain } from '../chain/enterFieldNodeChain';
import { exitFieldNodeChain } from '../chain/exitFieldNodeChain';
import { restoreAdoptedExternalErrors } from '../chain/restoreAdoptedExternalErrors';
import { clearWarningKeys } from '../report/clearWarningKeys';

/**
 * Commit the first form source through the same entry boundary as later writes.
 * @param root - Unloaded form root
 * @param value - Initial source, defaulting to the retained snapshot
 * @param option - Automatic-write selection for this load
 * @param settings - Whether the binding will request validation after commit
 * @returns Nothing; committed events are delivered before returning
 */
export const dispatchMount = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  value: unknown = root.runtime.loadSnapshot,
  option: WriteOption = WriteOption.Overwrite,
  settings: { deferValidation?: boolean } = {},
): void => {
  if (!enterFieldNodeChain(root)) return;
  clearWarningKeys(root.runtime);
  root.runtime.validationUnavailable = false;
  root.runtime.validationCompileReported = false;
  root.runtime.deferMountValidation = settings.deferValidation === true;
  if (!settings.deferValidation)
    (root.runtime.validationTargets ??= new Set()).add(root);
  root.runtime.mountingGuardPass = process.env.NODE_ENV !== 'production';
  try {
    loadFieldNodeAtMount(root, value, option);
  } catch (error) {
    captureChainError(root.runtime, error);
  } finally {
    restoreAdoptedExternalErrors(root);
    root.runtime.adoptedExternalErrors = undefined;
    const runtime = root.runtime;
    if (
      runtime.errorReporter?.hasConsumer() &&
      !runtime.validator &&
      runtime.validationMode !== ValidationMode.None &&
      !runtime.warningKeys?.has(FormWarningCode.ValidatorMissing)
    ) {
      (runtime.warningKeys ??= new Set()).add(FormWarningCode.ValidatorMissing);
      const record: FormErrorRecord = {
        level: 'warning',
        code: FormWarningCode.ValidatorMissing,
        message: 'Validation is disabled because no validator was selected',
      };
      (runtime.pendingWarningRecords ??= new Map()).set(
        FormWarningCode.ValidatorMissing,
        record,
      );
      runtime.chainOccurrences?.push({ kind: 'record', record });
    }
    root.runtime.mountingGuardPass = false;
    exitFieldNodeChain(root);
  }
};
