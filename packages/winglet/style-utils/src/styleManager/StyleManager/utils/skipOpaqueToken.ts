import {
  ASTERISK,
  BACKSLASH,
  DOUBLE_QUOTE,
  L_PAREN,
  SINGLE_QUOTE,
  SLASH,
} from '../constants/charCode';
import { findUnquotedUrlEnd } from './findUnquotedUrlEnd';

/**
 * Skips a token whose characters are never CSS structure: a quoted string, a
 * comment, a backslash escape or an unquoted `url(…)`.
 *
 * @param css - Stylesheet text
 * @param index - Index to inspect
 * @returns Index just past the token that starts at `index` (`css.length` when it
 * is unterminated), or `index` itself when no such token starts there.
 */
export const skipOpaqueToken = (css: string, index: number): number => {
  const code = css.charCodeAt(index);
  if (code === BACKSLASH) return index + 2;
  if (code === DOUBLE_QUOTE || code === SINGLE_QUOTE)
    return findQuoteEnd(css, index, code);
  if (code === SLASH && css.charCodeAt(index + 1) === ASTERISK) {
    const end = css.indexOf('*/', index + 2);
    return end === -1 ? css.length : end + 2;
  }
  return code === L_PAREN ? findUnquotedUrlEnd(css, index) : index;
};

const findQuoteEnd = (css: string, open: number, quote: number): number => {
  for (let index = open + 1, length = css.length; index < length; index++) {
    const code = css.charCodeAt(index);
    if (code === quote) return index + 1;
    if (code === 10 || code === 13 || code === 12) return index;
    if (code === BACKSLASH) {
      index++;
      if (css.charCodeAt(index) === 13 && css.charCodeAt(index + 1) === 10)
        index++;
    }
  }
  return css.length;
};
