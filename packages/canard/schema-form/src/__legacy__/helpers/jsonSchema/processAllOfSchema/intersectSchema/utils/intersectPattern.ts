/**
 * Intersects two regex patterns using AND logic by combining them with lookaheads.
 *
 * This function creates a combined regex pattern that requires both input patterns
 * to match. It uses positive lookaheads to ensure that a string must satisfy
 * both patterns simultaneously.
 *
 * @param basePattern - The base regex pattern (optional)
 * @param sourcePattern - The source regex pattern (optional)
 * @returns Combined pattern with AND logic, or undefined if both are undefined
 * @example
 * intersectPattern('\\d+', '[a-z]+') // Returns '(?=\\d+)(?=[a-z]+)'
 */
export const intersectPattern = (
  basePattern?: string,
  sourcePattern?: string,
): string | undefined => {
  if (!basePattern && !sourcePattern) return undefined;
  if (!basePattern) return sourcePattern;
  if (!sourcePattern) return basePattern;
  return '(?=' + basePattern + ')(?=' + sourcePattern + ')';
};
