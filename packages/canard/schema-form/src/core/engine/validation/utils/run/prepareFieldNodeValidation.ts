import type { FieldNodeRecord } from '../../../record';
import { ValidationMode } from '../../../types/state';

/** Record a forthcoming verdict before public callbacks; only a false-to-true hold owns the entry stamp.
 * @param node - Current chain root whose final request uses this same eligibility.
 * @returns Whether this active chain currently owes an automatic validation request. */
export const prepareFieldNodeValidation = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): boolean => {
  const runtime = node.rootNode.runtime;
  if (
    !runtime.entryDepth ||
    runtime.deferLoadValidation ||
    !((runtime.validationMode ?? 0) & ValidationMode.OnChange) ||
    runtime.validationUnavailable ||
    (runtime.chainInitialEmit === node.rootNode.emit &&
      !runtime.validationTargets?.size)
  )
    return false;
  if (!runtime.validationPending)
    runtime.validationPendingEntryStamp ??= runtime.validationStamp ??= 0;
  runtime.validationPending = true;
  return true;
};
