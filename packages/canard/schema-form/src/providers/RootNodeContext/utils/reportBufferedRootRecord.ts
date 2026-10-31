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
  reporter.root = load.recordRoots?.has(record)
    ? load.recordRoots.get(record)
    : load.root;
  load.recordRoots?.delete(record);
  try {
    reporter.report(record);
  } finally {
    reporter.root = load.root;
  }
};
