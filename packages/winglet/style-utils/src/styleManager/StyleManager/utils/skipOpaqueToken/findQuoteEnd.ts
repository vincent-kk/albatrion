import { getCssEscapeEnd } from '../../../../utils/cssTokens/getCssEscapeEnd';
import { EXTENDED_ESCAPE_START } from '../../../../utils/cssTokens/getEscapedUrlEnd';
import { BACKSLASH } from '../../constants/charCode';

/**
 * Finds the end of a quoted CSS token without interpreting its contents as structure.
 * @param css - Stylesheet text
 * @param open - Opening quote position
 * @param quote - ASCII code of that opening quote
 * @returns Position after the closing quote, a raw newline boundary, or the end of input
 */
export const findQuoteEnd = (
  css: string,
  open: number,
  quote: number,
): number => {
  for (let index = open + 1, length = css.length; index < length; index++) {
    const code = css.charCodeAt(index);
    if (code === quote) return index + 1;
    if (code === 10 || code === 13 || code === 12) return index;
    if (code === BACKSLASH) {
      const following = css.charCodeAt(index + 1);
      if (!EXTENDED_ESCAPE_START[following]) index++;
      else index = getCssEscapeEnd(css, index) - 1;
    }
  }
  return css.length;
};
