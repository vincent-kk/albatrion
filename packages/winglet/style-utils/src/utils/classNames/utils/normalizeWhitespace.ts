/**
 * Normalizes whitespace in a string to single spaces.
 * 
 * Converts all whitespace characters (spaces, tabs, newlines, carriage returns)
 * to single space characters and removes leading/trailing whitespace.
 * Uses optimized character-by-character processing with direct Unicode
 * character code comparison for maximum performance.
 * 
 * @param string - The string to normalize
 * @returns String with normalized whitespace
 * 
 * @example
 * ```typescript
 * // Multiple spaces
 * normalizeWhitespace('btn   primary'); // → 'btn primary'
 * 
 * // Mixed whitespace characters
 * normalizeWhitespace('btn\\t\\nprimary\\r'); // → 'btn primary'
 * 
 * // Leading/trailing whitespace
 * normalizeWhitespace('  btn primary  '); // → 'btn primary'
 * 
 * // Empty or whitespace-only strings
 * normalizeWhitespace('   '); // → ''
 * normalizeWhitespace(''); // → ''
 * 
 * // Already normalized
 * normalizeWhitespace('btn primary'); // → 'btn primary'
 * ```
 * 
 * @internal This function is optimized for processing class name strings
 * where whitespace normalization is typically needed only when duplicate
 * removal is disabled.
 */
export const normalizeWhitespace = (string: string): string => {
  if (!string) return '';
  let result = '';
  let prevWasSpace = true;
  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i);
    if (char === 32 || char === 9 || char === 10 || char === 13) {
      if (!prevWasSpace) {
        result += ' '; // 공백은 단일 스페이스(32)로 통일
        prevWasSpace = true;
      }
    } else {
      result += string[i];
      prevWasSpace = false;
    }
  }
  if (result.length > 0 && result.charCodeAt(result.length - 1) === 32)
    result = result.slice(0, -1);
  return result;
};
