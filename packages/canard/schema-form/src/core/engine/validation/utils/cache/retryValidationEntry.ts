import type { BlueprintSchema } from '../../../blueprint';
import type { ValidationEntry } from '../../types/validationEntry';
import type { Validator } from '../../types/validator';
import { evictSameIdRoots } from '../lifetime/evictSameIdRoots';
import { hasRetainedValidationRootId } from '../lifetime/hasRetainedValidationRootId';
import { clearDuplicateGuardFailures } from './clearDuplicateGuardFailures';

/** Retry one cached collision only after competing committed consumers disappear.
 * @param validator - Registration owner supporting recompilation of the same copy after guard calls.
 * @param authoredRoot - Root whose same-id recent registrations must be released first.
 * @param entry - Shared entry retaining its copy, guards and original failed rejection identity.
 * @returns Nothing; success clears duplicate failures and a failed retry remains permanently cached. */
export const retryValidationEntry = (
  validator: Validator,
  authoredRoot: BlueprintSchema,
  entry: ValidationEntry,
): void => {
  if (
    !entry.failure ||
    entry.duplicate !== true ||
    entry.retried === true ||
    hasRetainedValidationRootId(validator, authoredRoot)
  )
    return;
  entry.retried = true;
  evictSameIdRoots(validator, authoredRoot);
  try {
    entry.validate = validator.compile(entry.copy);
  } catch {
    return;
  }
  delete entry.failure;
  delete entry.duplicate;
  delete entry.rejection;
  clearDuplicateGuardFailures(entry);
};
