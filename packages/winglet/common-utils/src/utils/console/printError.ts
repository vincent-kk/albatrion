import { createConsoleArguments } from './utils/createConsoleArguments';

import type { PrintConsoleOptions } from './type';

/**
 * Print an error message to the console
 * @param title - The title of the error
 * @param message - The message to print
 * @param options - The options for the error
 */
export const printError = (
  title: string,
  message: readonly string[],
  options?: PrintConsoleOptions,
) =>
  console.error(...createConsoleArguments(title, message, options, '#ff0000', '#ff6b6b'));
