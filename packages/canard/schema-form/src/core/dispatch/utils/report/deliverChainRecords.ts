import { NON_JSON_WHOLE_VALUE } from '../../../../errors';
import type { FormErrorRecord } from '../../../../errors';
import type { SchemaNodeRuntime } from '../../../record';
import { reportOwnerlessError } from './reportOwnerlessError';

/**
 * Deliver every queued occurrence and isolate synchronous reporter failures.
 * @param runtime - Per-form reporter and delivery flag
 * @param records - Occurrences in their original order
 * @param original - Original default exposure, if any
 * @param caller - Whether a synchronous caller receives the final throw
 * @returns Handler failures in delivery order for final bundling
 */
export const deliverChainRecords = (
  runtime: Pick<SchemaNodeRuntime<unknown>, 'errorReporter' | 'reportingErrors'>,
  records: readonly FormErrorRecord[],
  original: unknown, caller: boolean,
): unknown[] => {
  const failures: unknown[] = [];
  const reporter = runtime.errorReporter;
  for (const record of records) {
    if (!reporter?.hasConsumer()) {
      if (process.env.NODE_ENV !== 'production' &&
        record.code === `SCHEMA_FORM_WARNING.${NON_JSON_WHOLE_VALUE}`)
        console.warn(record.code, record.message, record.details);
      continue;
    }
    runtime.reportingErrors = true;
    try { reporter.report(record); }
    catch (error) {
      if (caller) failures.push(error);
      else reportOwnerlessError(error);
    }
    finally { runtime.reportingErrors = false; }
  }
  if (!caller && original !== undefined) reportOwnerlessError(original);
  return failures;
};
