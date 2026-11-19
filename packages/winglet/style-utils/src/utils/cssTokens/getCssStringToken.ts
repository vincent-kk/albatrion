import { CssTokenKind } from './CssTokenKind';
import { getCssEscapeEnd } from './getCssEscapeEnd';
import { type CssSource, readCssCode } from './readCssCode';

/** Only these code units can terminate or escape a CSS string. */
const STRING_CONTROL = /["'\\\n\r\f]/g;

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
    STRING_CONTROL.lastIndex = index;
    while (STRING_CONTROL.test(source)) {
      index = STRING_CONTROL.lastIndex - 1;
      const code = source.charCodeAt(index);
      if (code === quote) return (index + 1) * 16 + CssTokenKind.String;
      if (code === 10 || code === 13 || code === 12) {
        if (code === 13 && source.charCodeAt(index + 1) === 10) index++;
        return (index + 1) * 16 + CssTokenKind.BadString;
      }
      STRING_CONTROL.lastIndex = code === 92 ? getCssEscapeEnd(source, index) : index + 1;
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
