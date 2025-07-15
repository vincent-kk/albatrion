import type { Dictionary } from '@aileron/declare';

import type {
  BasicSchema,
  FormatError,
  PublicJsonSchemaError,
} from '@/schema-form/types';

export const formatError: FormatError = (error, node, context) => {
  const errorMessages = node.jsonSchema.errorMessages;
  if (!errorMessages || !error.keyword) return error.message;
  const errorMessage = getErrorMessage(error.keyword, errorMessages, context);
  if (errorMessage)
    return replacePattern(errorMessage, error.details, node.value);
  return error.message;
};

type ErrorMessages = NonNullable<BasicSchema['errorMessages']>;

const getErrorMessage = (
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

const replacePattern = (
  errorMessage: string,
  details: PublicJsonSchemaError['details'],
  value: any,
): string => {
  let message = errorMessage;
  if (details && typeof details === 'object')
    for (const [key, value] of Object.entries(details))
      message = message.replace('{' + key + '}', '' + value);
  message = message.replace('{value}', '' + value);
  return message;
};
