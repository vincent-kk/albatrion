import { CssTokenKind } from './CssTokenKind';
import { CSS_POSITION_CLASS } from './cssPositionClass';
import { getCssEscapeEnd } from './getCssEscapeEnd';
import { type CssSource, readCssCode } from './readCssCode';

/**
 * Distinguish a quoted function and consume an unquoted URL or bad-URL remnant.
 * @param source Stylesheet code units or bytes.
 * @param open Opening parenthesis immediately after a verified URL name.
 * @returns Zero for a quoted function, otherwise the packed URL token with EOF information.
 */
export function getCssUrlToken(source: CssSource, open: number): number {
  let index = open + 1;
  for (;;) {
    const code = readCssCode(source, index);
    if (code === 34 || code === 39) return 0;
    if (code !== 32 && code !== 9 && code !== 10 && code !== 12 && code !== 13)
      break;
    index++;
  }
  while (index < source.length) {
    let code = readCssCode(source, index);
    while (code >= 128 || (CSS_POSITION_CLASS[code] & 128) === 0) {
      if (++index >= source.length)
        return source.length * 16 + CssTokenKind.OpenUrl;
      code = readCssCode(source, index);
    }
    if (code === 41) return (index + 1) * 16 + CssTokenKind.Url;
    index = code === 92 ? getCssEscapeEnd(source, index) : index + 1;
  }
  return source.length * 16 + CssTokenKind.OpenUrl;
}
