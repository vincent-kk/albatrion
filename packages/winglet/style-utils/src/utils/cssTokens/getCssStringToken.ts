import { CssTokenKind } from './CssTokenKind';
import { CSS_POSITION_CLASS } from './cssPositionClass';
import { getCssEscapeEnd } from './getCssEscapeEnd';
import { type CssSource, readCssCode } from './readCssCode';

/**
 * Consume a quoted string or its bad-string recovery boundary.
 * @param source Stylesheet code units or bytes.
 * @param start Opening quote.
 * @returns End position times sixteen plus the token kind; bad-string newline is retained.
 */
export function getCssStringToken(source: CssSource, start: number): number {
  const quote = readCssCode(source, start);
  let index = start + 1;
  if (typeof source === 'string') {
    while (index < source.length) {
      let code = source.charCodeAt(index);
      while (code >= 128 || (CSS_POSITION_CLASS[code] & 16) === 0) {
        if (++index >= source.length)
          return source.length * 16 + CssTokenKind.OpenString;
        code = source.charCodeAt(index);
      }
      if (code === quote) return (index + 1) * 16 + CssTokenKind.String;
      if (code === 10 || code === 13 || code === 12) {
        if (code === 13 && source.charCodeAt(index + 1) === 10) index++;
        return (index + 1) * 16 + CssTokenKind.BadString;
      }
      index = code === 92 ? getCssEscapeEnd(source, index) : index + 1;
    }
    return source.length * 16 + CssTokenKind.OpenString;
  }
  while (index < source.length) {
    const code = readCssCode(source, index);
    if (code === quote) return (index + 1) * 16 + CssTokenKind.String;
    if (code === 10 || code === 13 || code === 12) {
      if (code === 13 && readCssCode(source, index + 1) === 10) index++;
      return (index + 1) * 16 + CssTokenKind.BadString;
    }
    index = code === 92 ? getCssEscapeEnd(source, index) : index + 1;
  }
  return source.length * 16 + CssTokenKind.OpenString;
}
