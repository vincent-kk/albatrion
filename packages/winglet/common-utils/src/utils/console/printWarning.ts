import { map } from '@/common-utils/utils/array';

import type { PrintConsoleOptions } from './type';

/**
 * Prints a warning message to the console.
 * @param title - The title of the warning
 * @param message - The message lines to print
 * @param options - Presentation options and optional structured details
 */
export const printWarning = (
  title: string,
  message: readonly string[],
  options?: PrintConsoleOptions,
) =>
  console.warn(
    `%c${options?.info || ''}\n\n` +
      `%c ${options?.emoji || '⚠️'} ${title} ${options?.emoji || '⚠️'} \n\n` +
      map(message, (line: string) => `%c  ${line}\n`).join(''),
    'color: #666;',
    `color: ${options?.titleColor || '#f59e0b'}; font-weight: bold; font-size: 1.25em;`,
    ...map(message, () => `color: ${options?.messageColor || '#d97706'}`),
    ...(options?.details === undefined ? [] : [options.details]),
  );
