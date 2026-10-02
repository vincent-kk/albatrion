import { BOX_LINE_PREFIX } from './constants';

/**
 * Creates an indexed list from items.
 * @param items - Items to list
 * @param prefix - Prefix for each line (default: BOX_LINE_PREFIX)
 * @returns Formatted indexed list string
 */
export const formatIndexedList = (
  items: readonly (string | number)[],
  prefix = BOX_LINE_PREFIX,
): string => items.map((item, i) => `${prefix}[${i}] ${item}`).join('\n');
