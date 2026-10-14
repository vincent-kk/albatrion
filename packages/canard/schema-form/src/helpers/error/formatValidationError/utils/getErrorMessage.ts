import type { Dictionary } from '@aileron/declare';

import type { SchemaPresentation } from '@/schema-form/types';

type ErrorMessages = NonNullable<SchemaPresentation['errorMessages']>;

export const getErrorMessage = (
  keyword: string,
  errorMessages: ErrorMessages,
  context: Dictionary,
) => {
  const errorMessage = errorMessages[keyword] || errorMessages.default;
  if (typeof errorMessage === 'string') return errorMessage;
  if (
    errorMessage &&
    typeof errorMessage === 'object' &&
    context.locale !== undefined
  ) {
    const localeErrorMessage = errorMessage[context.locale];
    if (typeof localeErrorMessage === 'string') return localeErrorMessage;
  }
  return null;
};
