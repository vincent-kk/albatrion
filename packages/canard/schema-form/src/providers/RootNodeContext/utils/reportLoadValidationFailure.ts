import { isArray } from '@winglet/common-utils/filter';

import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';

import { reportErrorToHost } from '../../FormErrorContext';

/** Isolate only the consumer-error tail of an already engine-reported load failure.
 * @param failure - Rejection from explicit load root validation.
 * @returns Nothing; the engine owns reporting every validation failure. */
export const reportLoadValidationFailure = (failure: unknown): void => {
  if (
    !(failure instanceof SchemaFormError) ||
    failure.code !== FormErrorCode.MultipleErrors
  )
    return;
  const errors = failure.details?.errors;
  if (!isArray(errors)) return;
  for (let index = 1; index < errors.length; index++)
    reportErrorToHost(errors[index]);
};
