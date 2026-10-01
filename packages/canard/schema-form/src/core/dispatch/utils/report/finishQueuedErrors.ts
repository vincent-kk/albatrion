import { SchemaFormError } from '../../../../errors';
import type { FormErrorRecord } from '../../../../errors';
import type { SchemaNodeRuntime } from '../../../record';
import { bundleChainErrors } from './bundleChainErrors';
import { collectChainRecords } from './collectChainRecords';
import { deliverChainRecords } from './deliverChainRecords';

/**
 * Report and expose failures from a synchronous non-entry event wave.
 * @param runtime - Tree runtime with the current error reporter
 * @param errors - Original listener and state-callback failures in order
 * @param occurrences - Reportable occurrences retained during this wave
 * @param caller - Whether the wave exposes failures by throwing to its caller
 * @returns Nothing when the wave had no failures
 */
export const finishQueuedErrors = (
  runtime: Pick<SchemaNodeRuntime<unknown>, 'errorReporter' | 'reportingErrors'>,
  errors: readonly unknown[],
  occurrences: NonNullable<SchemaNodeRuntime<unknown>['chainOccurrences']>,
  caller: boolean,
): void => {
  const original = bundleChainErrors(errors);
  const aggregate = errors.length > 1 && original instanceof SchemaFormError ?
    original : undefined;
  const pending: FormErrorRecord[] = [];
  collectChainRecords(pending, occurrences, aggregate, caller ? 'thrown' : 'sink');
  const handlerErrors = deliverChainRecords(runtime, pending, original, caller);
  if (caller && (errors.length || handlerErrors.length))
    throw errors.length && handlerErrors.length ?
      bundleChainErrors([original, ...handlerErrors]) :
      errors.length ? original : bundleChainErrors(handlerErrors);
};
