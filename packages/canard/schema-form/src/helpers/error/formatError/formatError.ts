import type { FormatError } from '@/schema-form/types';

import { getErrorMessage } from './utils/getErrorMessage';
import { replacePattern } from './utils/replacePattern';

export const formatError: FormatError = (error, node, context) => {
  const errorMessages = node.jsonSchema.errorMessages;
  if (!errorMessages || !error.keyword) return error.message;
  const errorMessage = getErrorMessage(error.keyword, errorMessages, context);
  if (errorMessage)
    return replacePattern(errorMessage, error.details, node.value);
  return error.message;
};
