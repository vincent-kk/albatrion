import type { FieldNodeRuntime } from '../../../record';
import { reportValidationFailure } from './reportValidationFailure';

/** Install the common automatic-validation failure surfaces once per runtime.
 * @param runtime - Load runtime whose reporter is owned by the write boundary.
 * @returns Nothing; subsequent automatic runs reuse the same callback. */
export const ensureValidationFailureReporter = (
  runtime: Pick<
    FieldNodeRuntime<unknown>,
    'reportValidationFailure' | 'errorReporter' | 'reportingErrors'
  >,
): void => {
  runtime.reportValidationFailure ??= (failure) =>
    reportValidationFailure(runtime, failure);
};
