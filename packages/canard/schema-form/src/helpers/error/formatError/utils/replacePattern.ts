import type { PublicJsonSchemaError } from '@/schema-form/types';

export const replacePattern = (
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
