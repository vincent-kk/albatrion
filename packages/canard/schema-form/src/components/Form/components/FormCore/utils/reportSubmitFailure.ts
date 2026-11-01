import type { Optional } from '@aileron/declare';

import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';
import type { FormErrorService } from '@/schema-form/providers/FormErrorContext';

/** Report caller-owned degraded failures and retain handler exceptions in their rejection. */
export const reportSubmitFailure = (
  reporter: Optional<FormErrorService>,
  error: unknown,
  native: boolean,
): void => {
  if (
    reporter &&
    error instanceof SchemaFormError &&
    error.code === FormErrorCode.SubmitWhileDegraded
  ) {
    try {
      reporter.report({
        level: 'error',
        code: error.code,
        message: error.message,
        details: error.details,
        error,
        origin: 'submit',
      });
    } catch (handlerError) {
      throw new SchemaFormError(
        FormErrorCode.MultipleErrors,
        'Submit failure and error handler failure',
        { errors: [error, handlerError] },
      );
    }
  } else if (native) reporter?.capture(error, 'submit');
};
