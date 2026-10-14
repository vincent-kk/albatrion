/**
 * Default divider width for error message boxes.
 */
export const DEFAULT_DIVIDER_WIDTH = 50;

/**
 * Box drawing characters used in error message formatting.
 */
export const BOX_CHARS = {
  /** Top-left corner */
  TOP_LEFT: '╭',
  /** Bottom-left corner */
  BOTTOM_LEFT: '╰',
  /** Vertical line */
  VERTICAL: '│',
  /** Horizontal line */
  HORIZONTAL: '─',
  /** Left T-junction */
  LEFT_T: '├',
} as const;

/**
 * Common indentation prefix for box content lines.
 */
export const BOX_LINE_PREFIX = '  │    ';

/**
 * Common indentation prefix for labeled content.
 */
export const BOX_LABEL_PREFIX = '  │  ';
