/**
 * Replaces newlines in a string with box-compatible line breaks.
 * @param text - Text with newlines
 * @param prefix - Prefix for continuation lines
 * @returns Formatted multi-line string
 */
export const formatMultiLine = (text: string, prefix = '\n  │    '): string =>
  text.replace(/\n/g, prefix);
