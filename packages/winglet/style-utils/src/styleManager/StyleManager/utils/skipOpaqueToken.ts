import { getCssEscapeEnd } from '../../../utils/cssTokens/getCssEscapeEnd';
import { getEscapedUrlEnd } from '../../../utils/cssTokens/getEscapedUrlEnd';
import { mayExtendCssEscape } from '../../../utils/cssTokens/mayExtendCssEscape';
import {
  ASTERISK,
  BACKSLASH,
  DOUBLE_QUOTE,
  L_PAREN,
  SINGLE_QUOTE,
  SLASH,
} from '../constants/charCode';
import { findUnquotedUrlEnd } from './findUnquotedUrlEnd';
import { findQuoteEnd } from './skipOpaqueToken/findQuoteEnd';

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
  if (code === BACKSLASH) {
    const following = css.charCodeAt(index + 1);
    if (!mayExtendCssEscape(following)) return Math.min(index + 2, css.length);
    const end = getEscapedUrlEnd(css, index);
    return end === index ? getCssEscapeEnd(css, index) : end;
  }
  if (code === DOUBLE_QUOTE || code === SINGLE_QUOTE)
    return findQuoteEnd(css, index, code);
  if (code === SLASH && css.charCodeAt(index + 1) === ASTERISK) {
    const end = css.indexOf('*/', index + 2);
    return end === -1 ? css.length : end + 2;
  }
  return code === L_PAREN ? findUnquotedUrlEnd(css, index) : index;
};
