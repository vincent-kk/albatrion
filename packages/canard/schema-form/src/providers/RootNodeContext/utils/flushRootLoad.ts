import { reportErrorToHost } from '../../FormErrorContext';
import type { RootLoad } from '../type';

/** Deliver a committed load once; root fallback drops warnings from abandoned children. */
export const flushRootLoad = (load: RootLoad, errorsOnly = false): void => {
  if (load.reporter && load.root) load.reporter.root = load.root;
  if (load.reported) return;
  load.reported = true;
  for (const record of load.records.splice(0))
    if (!errorsOnly || record.level === 'error') {
      try {
        load.reporter?.report(record);
      } catch (error) {
        reportErrorToHost(error);
      }
    }
  if (load.error) {
    load.reporter?.capture(load.error);
    reportErrorToHost(load.error);
  }
};
