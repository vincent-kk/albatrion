import type { SchemaNodeRecord } from '../../../record';
import { loadSchemaNodeAtMount } from '../../../settle';
import { SetValueOption } from '../../../types/value';
import { enterSchemaNodeChain } from '../chain/enterSchemaNodeChain';
import { exitSchemaNodeChain } from '../chain/exitSchemaNodeChain';
import { VALIDATOR_MISSING } from '../../../../errors';
import { ValidationMode } from '../../../types/state';

/**
 * Commit the first form source through the same entry boundary as later writes.
 * @param root - Unloaded form root
 * @param value - Initial source, defaulting to the retained snapshot
 * @param option - Automatic-write selection for this load
 * @returns Nothing; committed events are delivered before returning
 */
export const dispatchMount = <Self extends SchemaNodeRecord<Self>>(
  root: Self, value: unknown = root.runtime.loadSnapshot,
  option: SetValueOption = SetValueOption.Overwrite,
): void => {
  enterSchemaNodeChain(root);
  (root.runtime.validationTargets ??= new Set()).add(root);
  root.runtime.mountingGuardPass = process.env.NODE_ENV !== 'production';
  try { loadSchemaNodeAtMount(root, value, option); }
  catch (error) { root.runtime.chainErrors?.push(error); }
  finally {
    const runtime = root.runtime;
    if (!runtime.validator && runtime.validationMode !== ValidationMode.None &&
      !runtime.warningKeys?.has(VALIDATOR_MISSING)) {
      (runtime.warningKeys ??= new Set()).add(VALIDATOR_MISSING);
      (runtime.pendingWarningRecords ??= new Map()).set(VALIDATOR_MISSING,
        { level: 'warning', code: 'SCHEMA_FORM_WARNING.VALIDATOR_MISSING',
          message: 'Validation is disabled because no validator was selected',
          surface: 'sink' });
    }
    root.runtime.mountingGuardPass = false;
    exitSchemaNodeChain(root);
  }
};
