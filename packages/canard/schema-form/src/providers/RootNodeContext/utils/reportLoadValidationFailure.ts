import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';

import { reportFailureToHost } from '../../FormErrorContext';

/** Forward an engine-reported slot verdict failure once to the host.
 * @param failure - Original verdict rejection or ordered consumer-error bundle; compile failures are ignored.
 * @returns Nothing; bundle elements reach the host in order without recapturing engine records. */
export const reportLoadValidationFailure = (failure: unknown): void => {
  if (
    failure instanceof SchemaFormError &&
    failure.code === FormErrorCode.ValidatorCompileFailed
  )
    return;
  reportFailureToHost(failure);
};
