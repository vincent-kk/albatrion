import type { FormatError } from '@canard/schema-form';

export const formatError: FormatError = (error, node) => {
  const errorMessages = node.jsonSchema.errorMessages;
  if (!errorMessages || !error.keyword) return error.message;
  let message = errorMessages[error.keyword] as string;
  if (typeof message !== 'string') return error.message;
  const details = error.details;
  if (details && typeof details === 'object') {
    for (const [key, value] of Object.entries(details))
      message = message.replace(`{${key}}`, '' + value);
  }
  message = message.replace('{value}', '' + node.value);
  return message;
};
