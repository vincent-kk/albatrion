import { DEFAULT_DIVIDER_WIDTH } from './constants';

/**
 * Creates a horizontal divider line.
 * @param width - Width of the divider (default: 50)
 */
export const createDivider = (width = DEFAULT_DIVIDER_WIDTH): string =>
  '─'.repeat(width);
