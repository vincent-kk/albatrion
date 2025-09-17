import type { Dictionary } from '@aileron/declare';

import type { BasicSchema } from '@/schema-form/types';

type ErrorMessages = NonNullable<BasicSchema['errorMessages']>;

export const getErrorMessage = (
  keyword: string,
  errorMessages: ErrorMessages,
  context: Dictionary,
) => {
  const errorMessage = errorMessages[keyword] || errorMessages.default;
  if (typeof errorMessage === 'string') return errorMessage;
  if (errorMessage && typeof errorMessage === 'object' && 'locale' in context) {
    const localeErrorMessage = errorMessage[context.locale];
    if (typeof localeErrorMessage === 'string') return localeErrorMessage;
  }
  return null;
};
