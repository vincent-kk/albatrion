import type { PublicJsonSchemaError } from '@/schema-form/types';

export const replacePattern = (
  errorMessage: string,
  details: PublicJsonSchemaError['details'],
  value: any,
): string => {
  let message = errorMessage;
  if (details && typeof details === 'object') {
    const keys = Object.keys(details);
    for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i])
      message = message.replace('{' + k + '}', '' + details[k]);
  }
  message = message.replace('{value}', '' + value);
  return message;
};
