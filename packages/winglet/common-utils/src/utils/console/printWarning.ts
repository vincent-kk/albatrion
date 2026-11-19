import { createConsoleArguments } from './utils/createConsoleArguments';

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
  console.warn(...createConsoleArguments(title, message, options, '#f59e0b', '#d97706'));
