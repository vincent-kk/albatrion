/**
 * Formats a value preview with optional length truncation.
 * @param value - Value to preview
 * @param maxLength - Maximum string length (default: 80)
 * @returns Truncated string representation
 */
export const formatValuePreview = (value: unknown, maxLength = 80): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  try {
    const str = JSON.stringify(value);
    return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
  } catch {
    return String(value);
  }
};
