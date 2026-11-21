import { getCssUrlToken } from './getCssUrlToken';
import { getCssEscapeCode } from './getCssEscapeCode';
import { getCssEscapeEnd } from './getCssEscapeEnd';
import { isCssNameBoundary } from './isCssNameBoundary';
import { type CssSource, readCssCode } from './readCssCode';

/**
 * Recognize an escaped spelling of the URL token only on the scanner's existing escape path.
 * @param source Text or UTF-8 stylesheet bytes.
 * @param escape First escape encountered in a candidate name.
 * @returns End of an unquoted URL token, or the original escape position when it is another token.
 */
export const getEscapedUrlEnd = (source: CssSource, escape: number): number => {
  let start = escape;
  for (let count = 0; count < 2 && start > 0; count++) {
    const code = readCssCode(source, start - 1) | 32;
    if (code < 97 || code > 122) break;
    start--;
  }
  if (!isCssNameBoundary(source, start)) return escape;
  let cursor = start;
  for (const expected of [117, 114, 108]) {
    const code = readCssCode(source, cursor);
    const escaped = code === 92;
    if (((escaped ? getCssEscapeCode(source, cursor) : code) | 32) !== expected)
      return escape;
    cursor = escaped ? getCssEscapeEnd(source, cursor) : cursor + 1;
  }
  if (readCssCode(source, cursor) !== 40) return escape;
  const token = getCssUrlToken(source, cursor);
  return token === 0 ? escape : Math.floor(token / 16);
};
