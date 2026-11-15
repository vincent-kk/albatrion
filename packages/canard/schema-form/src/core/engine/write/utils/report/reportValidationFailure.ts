import { SchemaFormError } from '../../../../../errors';
import type { FieldNodeRuntime } from '../../../record';
import { flushFieldNodeSettings } from '../chain/flushFieldNodeSettings';
import { readFormErrorCode } from './readFormErrorCode';
import { reportOwnerlessFailure } from './reportOwnerlessFailure';

/**
 * Expose an asynchronous validator or result-listener failure once to each surface.
 * @param runtime - Tree whose reporter receives the structured occurrence.
 * @param failure - Original structured validation or delivery failure.
 * @returns Nothing; the sink owns the uncaught asynchronous surface.
 */
export const reportValidationFailure = (
  runtime: Pick<
    FieldNodeRuntime<unknown>,
    | 'errorReporter'
    | 'isReportingErrors'
    | 'applyPendingSettings'
    | 'entryDepth'
    | 'chainRoot'
    | 'isFlushingQueuedEvents'
  >,
  failure: unknown,
): void => {
  if (runtime.errorReporter?.hasConsumer()) {
    const wasReportingErrors = runtime.isReportingErrors;
    runtime.isReportingErrors = true;
    try {
      runtime.errorReporter.report({
        level: 'error',
        code: readFormErrorCode(failure),
        message: failure instanceof Error ? failure.message : String(failure),
        ...(failure instanceof SchemaFormError
          ? { details: failure.details }
          : {}),
        error: failure,
        origin: 'validate',
      });
    } catch (reporterFailure) {
      reportOwnerlessFailure(reporterFailure);
    } finally {
      runtime.isReportingErrors = wasReportingErrors;
    }
  }
  try {
    reportOwnerlessFailure(failure);
  } finally {
    flushFieldNodeSettings(runtime);
  }
};
