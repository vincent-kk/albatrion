import { FormErrorCode, SchemaFormError } from '../../../../../errors';
import type { FieldNodeRuntime } from '../../../record';

/**
 * Refuse a synchronous write to the form whose error reporter is active.
 * @param runtime - Runtime owning the target form
 * @returns Nothing when no error record is being delivered
 * @throws FormErrorCode.WriteInObserver before the write can join a chain
 */
export const assertNotInDelivery = (
  runtime: Pick<FieldNodeRuntime<unknown>, 'reportingErrors'>,
): void => {
  if (runtime.reportingErrors)
    throw new SchemaFormError(
      FormErrorCode.WriteInObserver,
      'A form cannot be written while its error observer is running',
    );
};
