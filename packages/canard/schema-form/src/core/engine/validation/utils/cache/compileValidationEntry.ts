import type { BlueprintSchema } from '../../../blueprint';
import type { Validator } from '../../types/validator';
import { evictSameIdRoots } from '../lifetime/evictSameIdRoots';
import { hasRetainedValidationRootId } from '../lifetime/hasRetainedValidationRootId';
import { DUPLICATE_SCHEMA_ID_MESSAGE } from './constants';
import type { ValidationEntry } from './readValidationEntry';

/** Compile the shared whole-schema copy once, retaining either outcome for later demand.
 * @param validator - Selected instance owning the entry and its root registrations.
 * @param authoredRoot - Root whose released same-id registrations must be evicted immediately before compile.
 * @param entry - Shared copy and guard cache, unchanged by the whole-schema compilation attempt.
 * @returns Nothing; records the validator or failure and whether a retained-id collision caused it. */
export const compileValidationEntry = (
  validator: Validator,
  authoredRoot: BlueprintSchema,
  entry: ValidationEntry,
): void => {
  if (entry.compiled) return;
  entry.compiled = true;
  evictSameIdRoots(validator, authoredRoot);
  try {
    entry.validate = validator.compile(entry.copy);
  } catch (error) {
    entry.failure = error;
    entry.duplicate =
      error instanceof Error &&
      DUPLICATE_SCHEMA_ID_MESSAGE.test(error.message) &&
      hasRetainedValidationRootId(validator, authoredRoot);
  }
};
