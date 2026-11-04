import type { FormErrorOrigin } from '../../../../../errors';
import type { PendingFormErrorRecord } from '../../../../../errors';
import type { FieldNodeRuntime } from '../../../record';
import { bundleChainErrors } from './bundleChainErrors';
import { collectChainRecords } from './collectChainRecords';
import { deliverChainRecords } from './deliverChainRecords';

/**
 * Report and expose failures from a synchronous non-entry event wave.
 * @param runtime - Tree runtime with the current error reporter
 * @param errors - Original listener and state-callback failures in order
 * @param occurrences - Reportable occurrences retained during this wave
 * @param caller - Whether the wave exposes failures by throwing to its caller
 * @param origin - Chain or standalone event-wave operation
 * @returns Nothing when the wave had no failures
 */
export const finishQueuedErrors = (
  runtime: Pick<
    FieldNodeRuntime<unknown>,
    'errorReporter' | 'reportingErrors' | 'reportedGuardFailures'
  >,
  errors: readonly unknown[],
  occurrences: NonNullable<FieldNodeRuntime<unknown>['chainOccurrences']>,
  caller: boolean,
  origin: FormErrorOrigin,
): void => {
  const original = bundleChainErrors(errors);
  const pending: PendingFormErrorRecord[] = [];
  collectChainRecords(
    pending,
    occurrences,
    origin,
    runtime.reportedGuardFailures,
  );
  const handlerErrors = deliverChainRecords(
    runtime,
    pending,
    original,
    caller,
    origin,
  );
  if (caller && (errors.length || handlerErrors.length))
    throw errors.length && handlerErrors.length
      ? bundleChainErrors([original, ...handlerErrors])
      : errors.length
        ? original
        : bundleChainErrors(handlerErrors);
};
