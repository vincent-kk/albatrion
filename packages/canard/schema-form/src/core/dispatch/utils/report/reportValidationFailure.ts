import { SchemaFormError } from '../../../../errors';
import type { SchemaNodeRuntime } from '../../../record';
import { reportOwnerlessError } from './reportOwnerlessError';
import { readFormErrorCode } from './readFormErrorCode';

/**
 * Expose an asynchronous validator or result-listener failure once to each surface.
 * @param runtime - Tree whose reporter receives the structured occurrence.
 * @param failure - Original structured validation or delivery failure.
 * @returns Nothing; the sink owns the uncaught asynchronous surface.
 */
export const reportValidationFailure = (
  runtime: Pick<SchemaNodeRuntime<unknown>, 'errorReporter' | 'reportingErrors'>,
  failure: unknown,
): void => {
  if (runtime.errorReporter?.hasConsumer()) {
    const wasReporting = runtime.reportingErrors;
    runtime.reportingErrors = true;
    try {
      runtime.errorReporter.report({ level: 'error',
        code: readFormErrorCode(failure),
        message: failure instanceof Error ? failure.message : String(failure),
        ...(failure instanceof SchemaFormError ? { details: failure.details } : {}),
        error: failure, surface: 'sink' });
    } catch (reporterFailure) { reportOwnerlessError(reporterFailure); }
    finally { runtime.reportingErrors = wasReporting; }
  }
  reportOwnerlessError(failure);
};
