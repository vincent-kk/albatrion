import { BOX_LINE_PREFIX } from './constants';

/**
 * Creates a JSON preview of a value with optional truncation.
 * @param value - Value to preview
 * @param maxLines - Maximum number of lines to show
 * @param prefix - Prefix for each line (default: BOX_LINE_PREFIX)
 * @returns Formatted preview string with truncation indicator if needed
 */
export const formatJsonPreview = (
  value: unknown,
  maxLines = 10,
  prefix = BOX_LINE_PREFIX,
): { preview: string; truncated: boolean } => {
  const lines = JSON.stringify(value, null, 2).split('\n');
  const truncated = lines.length > maxLines;
  const preview = lines
    .slice(0, maxLines)
    .map((line) => `${prefix}${line}`)
    .join('\n');
  return { preview, truncated };
};
