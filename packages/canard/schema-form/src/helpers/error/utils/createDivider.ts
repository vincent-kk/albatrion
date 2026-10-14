/**
 * Default divider width for error message boxes.
 */
const DEFAULT_DIVIDER_WIDTH = 50;

/**
 * Creates a horizontal divider line.
 * @param width - Width of the divider (default: 50)
 */
export const createDivider = (width = DEFAULT_DIVIDER_WIDTH): string =>
  '─'.repeat(width);
