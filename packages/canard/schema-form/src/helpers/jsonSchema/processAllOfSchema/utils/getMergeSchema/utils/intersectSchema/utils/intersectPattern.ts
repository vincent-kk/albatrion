/**
 * Pattern들을 AND로 결합합니다.
 */
export function intersectPattern(
  basePattern?: string,
  sourcePattern?: string,
): string | undefined {
  if (!basePattern && !sourcePattern) return undefined;
  if (!basePattern) return sourcePattern;
  if (!sourcePattern) return basePattern;
  return '(?=' + basePattern + ')(?=' + sourcePattern + ')';
}
