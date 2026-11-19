import { CssTokenKind } from './CssTokenKind';
import { getCssEscapeEnd } from './getCssEscapeEnd';
import { type CssSource, readCssCode } from './readCssCode';

/**
 * Consume an unquoted URL or bad-URL remnant; punctuation inside is never structure.
 * @param source Stylesheet code units or bytes.
 * @param open Opening parenthesis of a verified unquoted URL.
 * @returns End position times sixteen plus URL kind, retaining EOF information.
 */
export function getCssUrlToken(source: CssSource, open: number): number {
  let index = open + 1;
  while (index < source.length) {
    const code = readCssCode(source, index);
    if (code === 41) return (index + 1) * 16 + CssTokenKind.Url;
    index = code === 92 ? getCssEscapeEnd(source, index) : index + 1;
  }
  return source.length * 16 + CssTokenKind.OpenUrl;
}
