import { BOX_LINE_PREFIX } from './constants';

/**
 * Creates a bullet list from items.
 * @param items - Items to list
 * @param prefix - Prefix for each line (default: BOX_LINE_PREFIX)
 * @param emptyMessage - Message when list is empty
 * @returns Formatted bullet list string
 */
export const formatBulletList = (
  items: readonly (string | number)[],
  prefix = BOX_LINE_PREFIX,
  emptyMessage = '(none)',
): string => {
  if (items.length === 0) return `${prefix}${emptyMessage}`;
  return items.map((item) => `${prefix}• ${item}`).join('\n');
};
