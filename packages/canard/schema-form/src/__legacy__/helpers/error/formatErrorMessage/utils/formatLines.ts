import { BOX_LINE_PREFIX } from './constants';

/**
 * Formats lines with a prefix for box content.
 * @param lines - Lines to format
 * @param prefix - Prefix for each line (default: BOX_LINE_PREFIX)
 * @returns Formatted lines string
 */
export const formatLines = (
  lines: readonly string[],
  prefix = BOX_LINE_PREFIX,
): string => lines.map((line) => `${prefix}${line}`).join('\n');
