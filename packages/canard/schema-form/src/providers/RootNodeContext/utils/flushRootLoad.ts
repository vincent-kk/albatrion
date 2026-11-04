import { reportFailureToHost } from '../../FormErrorContext';
import type { RootLoad } from '../type';
import { reportBufferedRootRecord } from './reportBufferedRootRecord';

/** Deliver a committed load once; root fallback drops warnings from abandoned children. */
export const flushRootLoad = (load: RootLoad, errorsOnly = false): void => {
  if (load.reporter && load.root) load.reporter.root = load.root;
  if (load.reported) return;
  load.reported = true;
  for (const record of load.records.splice(0))
    if (!errorsOnly || record.level === 'error') {
      try {
        reportBufferedRootRecord(load, record);
      } catch (error) {
        reportFailureToHost(error);
      }
    }
  if (load.error) {
    load.reporter?.capture(load.error, 'load');
    reportFailureToHost(load.error);
  }
};
