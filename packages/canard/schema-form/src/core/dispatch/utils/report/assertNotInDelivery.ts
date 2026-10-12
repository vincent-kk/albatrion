import { SchemaFormError, WRITE_IN_OBSERVER } from '../../../../errors';
import type { SchemaNodeRuntime } from '../../../record';

/**
 * Refuse a synchronous write to the form whose error reporter is active.
 * @param runtime - Runtime owning the target form
 * @returns Nothing when no error record is being delivered
 * @throws WRITE_IN_OBSERVER before the write can join a chain
 */
export const assertNotInDelivery = (
  runtime: Pick<SchemaNodeRuntime<unknown>, 'reportingErrors'>,
): void => {
  if (runtime.reportingErrors)
    throw new SchemaFormError(WRITE_IN_OBSERVER,
      'A form cannot be written while its error observer is running');
};
