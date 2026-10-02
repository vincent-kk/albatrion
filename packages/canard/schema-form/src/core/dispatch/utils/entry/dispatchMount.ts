import type { SchemaNodeRecord } from '../../../record';
import { loadSchemaNodeAtMount } from '../../../settle';
import { SetValueOption } from '../../../types/value';
import { enterSchemaNodeChain } from '../chain/enterSchemaNodeChain';
import { captureChainError } from '../chain/captureChainError';
import { exitSchemaNodeChain } from '../chain/exitSchemaNodeChain';
import { VALIDATOR_MISSING } from '../../../../errors';
import type { FormErrorRecord } from '../../../../errors';
import { ValidationMode } from '../../../types/state';
import { clearWarningKeys } from '../report/clearWarningKeys';
import { restoreAdoptedExternalErrors } from '../chain/restoreAdoptedExternalErrors';

/**
 * Commit the first form source through the same entry boundary as later writes.
 * @param root - Unloaded form root
 * @param value - Initial source, defaulting to the retained snapshot
 * @param option - Automatic-write selection for this load
 * @param settings - Whether the binding will request validation after commit
 * @returns Nothing; committed events are delivered before returning
 */
export const dispatchMount = <Self extends SchemaNodeRecord<Self>>(
  root: Self, value: unknown = root.runtime.loadSnapshot,
  option: SetValueOption = SetValueOption.Overwrite,
  settings: { deferValidation?: boolean } = {},
): void => {
  if (!enterSchemaNodeChain(root)) return;
  clearWarningKeys(root.runtime);
  root.runtime.validationUnavailable = false;
  root.runtime.validationCompileReported = false;
  root.runtime.deferMountValidation = settings.deferValidation === true;
  if (!settings.deferValidation)
    (root.runtime.validationTargets ??= new Set()).add(root);
  root.runtime.mountingGuardPass = process.env.NODE_ENV !== 'production';
  try { loadSchemaNodeAtMount(root, value, option); }
  catch (error) { captureChainError(root.runtime, error); }
  finally {
    restoreAdoptedExternalErrors(root);
    root.runtime.adoptedExternalErrors = undefined;
    const runtime = root.runtime;
    if (runtime.errorReporter?.hasConsumer() && !runtime.validator &&
      runtime.validationMode !== ValidationMode.None &&
      !runtime.warningKeys?.has(VALIDATOR_MISSING)) {
      (runtime.warningKeys ??= new Set()).add(VALIDATOR_MISSING);
      const record: FormErrorRecord =
        { level: 'warning',
          code: 'SCHEMA_FORM_WARNING.VALIDATOR_MISSING',
          message: 'Validation is disabled because no validator was selected' };
      (runtime.pendingWarningRecords ??= new Map()).set(VALIDATOR_MISSING, record);
      runtime.chainOccurrences?.push({ kind: 'record', record });
    }
    root.runtime.mountingGuardPass = false;
    exitSchemaNodeChain(root);
  }
};
