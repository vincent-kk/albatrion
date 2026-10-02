/**
 * Formats an array preview with truncation for long arrays.
 * @param arr - Array to preview
 * @param maxItems - Maximum number of items to show (default: 4)
 * @returns Formatted array preview string
 */
export const formatArrayPreview = <T>(
  arr: readonly T[],
  maxItems = 4,
): string => {
  if (arr.length <= maxItems) {
    return JSON.stringify(arr);
  }
  const preview = arr.slice(0, maxItems - 1).map((v) => JSON.stringify(v));
  return `[${preview.join(', ')}, ... +${arr.length - (maxItems - 1)} more]`;
};
