import type { FieldNodeRecord } from '../../../record';
import { ValidationMode } from '../../../types/state';
import { sameValueZero } from '../../../utils/compute/sameValueZero';

/** Record a forthcoming verdict before public callbacks; only a false-to-true hold owns the entry stamp.
 * @param node - Current chain root whose final request uses this same eligibility.
 * @param hasOutputChanged - An already-read output comparison from the same chain boundary, if available.
 * @returns Whether this active chain currently owes an automatic validation request. */
export const prepareFieldNodeValidation = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  hasOutputChanged?: boolean,
): boolean => {
  const runtime = node.rootNode.runtime;
  if (
    !runtime.entryDepth ||
    runtime.shouldDeferLoadValidation ||
    !(
      (runtime.validationMode ?? ValidationMode.None) & ValidationMode.OnChange
    ) ||
    runtime.isValidationUnavailable ||
    (!(hasOutputChanged ??
      !sameValueZero(
        runtime.chainInitialOutputValue,
        node.rootNode.storedOutputValue,
      )) &&
      !runtime.validationTargets?.size)
  )
    return false;
  if (!runtime.isValidationPending)
    runtime.validationPendingEntryStamp ??= runtime.validationStamp ??= 0;
  runtime.isValidationPending = true;
  return true;
};
