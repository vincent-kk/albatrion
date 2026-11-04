import { FormWarningCode } from '../../../../../errors';
import type {
  FormErrorOrigin,
  PendingFormErrorRecord,
} from '../../../../../errors';
import type { FieldNodeRuntime } from '../../../record';
import { reportOwnerlessFailure } from './reportOwnerlessFailure';

/**
 * Deliver every queued occurrence and isolate synchronous reporter failures.
 * @param runtime - Per-form reporter and delivery flag
 * @param records - Occurrences in their original order
 * @param original - Original default exposure, if any
 * @param caller - Whether a synchronous caller receives the final throw
 * @param origin - Enclosing operation for records without an explicit origin
 * @returns Handler failures in delivery order for final bundling
 */
export const deliverChainRecords = (
  runtime: Pick<FieldNodeRuntime<unknown>, 'errorReporter' | 'reportingErrors'>,
  records: readonly PendingFormErrorRecord[],
  original: unknown,
  caller: boolean,
  origin: FormErrorOrigin,
): unknown[] => {
  const failures: unknown[] = [];
  const reporter = runtime.errorReporter;
  for (const record of records) {
    const delivered = Object.assign(record, {
      origin: record.origin ?? origin,
    });
    if (!reporter?.hasConsumer()) {
      if (
        process.env.NODE_ENV !== 'production' &&
        (record.code === FormWarningCode.NonJsonWholeValue ||
          record.code === FormWarningCode.DetachedNodeWrite ||
          record.code === FormWarningCode.WriteInInactiveResolver)
      )
        console.warn(record.code, record.message, record.details);
      continue;
    }
    const previous = runtime.reportingErrors;
    runtime.reportingErrors = true;
    try {
      reporter.report(delivered);
    } catch (error) {
      if (caller) failures.push(error);
      else reportOwnerlessFailure(error);
    } finally {
      runtime.reportingErrors = previous;
    }
  }
  if (!caller && original !== undefined) reportOwnerlessFailure(original);
  return failures;
};
