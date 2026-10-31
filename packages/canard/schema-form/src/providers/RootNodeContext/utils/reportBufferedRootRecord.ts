import { observeFieldNodeReports } from '@/schema-form/core';
import type { FormErrorRecord } from '@/schema-form/errors';

import type { RootLoad } from '../type';

/** Deliver one buffered report using the root that raised it.
 * @param load - Load retaining the undelivered report.
 * @param record - Report consumed exactly once by the caller.
 * @returns Nothing; consumer failures propagate to the caller's isolation boundary. */
export const reportBufferedRootRecord = (
  load: RootLoad,
  record: FormErrorRecord,
): void => {
  const reporter = load.reporter;
  if (!reporter) return;
  const origin = load.recordOrigins?.get(record);
  reporter.root = origin?.root ?? load.root;
  const scope = origin?.warningScope ?? load.warningScope;
  load.recordOrigins?.delete(record);
  const report = () =>
    scope ? reporter.reportInLoad(record, scope) : reporter.report(record);
  try {
    if (load.root) observeFieldNodeReports(load.root, report);
    else report();
  } finally {
    reporter.root = load.root;
  }
};
