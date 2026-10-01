import { JSONSchemaError, SchemaFormError } from '../../../../errors';
import type { FormErrorRecord } from '../../../../errors';
import type { SchemaNodeRuntime } from '../../../record';
import { bundleChainErrors } from './bundleChainErrors';
import { createFormErrorRecord } from './createFormErrorRecord';
import { deliverChainRecords } from './deliverChainRecords';
import { readFormErrorCode } from './readFormErrorCode';

/**
 * Report and expose failures from a synchronous non-entry event wave.
 * @param runtime - Tree runtime with the current error reporter
 * @param errors - Original listener and state-callback failures in order
 * @param occurrences - Reportable occurrences retained during this wave
 * @returns Nothing when the wave had no failures
 */
export const finishQueuedErrors = (
  runtime: Pick<SchemaNodeRuntime<unknown>, 'errorReporter' | 'reportingErrors'>,
  errors: readonly unknown[],
  occurrences: NonNullable<SchemaNodeRuntime<unknown>['chainOccurrences']>,
): void => {
  const original = bundleChainErrors(errors);
  const aggregate = errors.length > 1 && original instanceof SchemaFormError ?
    original : undefined;
  const pending: FormErrorRecord[] = [];
  for (const occurrence of occurrences) {
    if (occurrence.kind === 'record') {
      pending.push(occurrence.record);
      continue;
    }
    const error = occurrence.error;
    const record = createFormErrorRecord(true, readFormErrorCode(error), 'error',
      () => error instanceof Error ? error.message : String(error),
      { error, ...(error instanceof SchemaFormError ||
        error instanceof JSONSchemaError ? { details: error.details } : {}),
        ...(aggregate ? { aggregate } : {}), surface: 'thrown' });
    if (record) pending.push(record);
  }
  const handlerErrors = deliverChainRecords(runtime, pending, original, true);
  if (errors.length || handlerErrors.length)
    throw errors.length && handlerErrors.length ?
      bundleChainErrors([original, ...handlerErrors]) :
      errors.length ? original : bundleChainErrors(handlerErrors);
};
