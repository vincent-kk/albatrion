import type { FormatError, JSONSchema } from '@/schema-form/types';

import { replacePattern } from './utils/replacePattern';
import { selectKeywordErrorMessage } from './utils/selectKeywordErrorMessage';

export const formatValidationError: FormatError = (error, node, context) => {
  const errorMessages = (node.jsonSchema as JSONSchema).presentation
    ?.errorMessages;
  if (!errorMessages || !error.keyword) return error.message;
  const errorMessage = selectKeywordErrorMessage(
    error.keyword,
    errorMessages,
    context,
  );
  if (errorMessage)
    return replacePattern(errorMessage, error.details, node.value);
  return error.message;
};
