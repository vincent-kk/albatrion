import { map } from '@/common-utils/utils/array';

import type { PrintConsoleOptions } from './type';

/**
 * Print an error message to the console
 * @param title - The title of the error
 * @param message - The message to print
 * @param options - The options for the error
 */
export const printError = (
  title: string,
  message: string[],
  options?: PrintConsoleOptions,
) =>
  console.error(
    `%c${options?.info || ''}\n\n` +
      `%c ${options?.emoji || '⚠️'} ${title} ${options?.emoji || '⚠️'} \n\n` +
      map(message, (line: string) => `%c  ${line}\n`).join(''),
    'color: #666;',
    `color: ${options?.titleColor || '#ff0000'}; font-weight: bold; font-size: 1.25em;`,
    ...map(message, () => `color: ${options?.messageColor || '#ff6b6b'}`),
    ...(options?.details === undefined ? [] : [options.details]),
  );
