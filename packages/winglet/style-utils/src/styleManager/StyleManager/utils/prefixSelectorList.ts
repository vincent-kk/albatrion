import {
  BACKSLASH,
  COMMA,
  L_PAREN,
  R_PAREN,
  SLASH,
} from '../constants/charCode';
import { prefixSelector } from './prefixSelector';
import { skipOpaqueToken } from './skipOpaqueToken';
import { trimSelector } from './trimSelector';

/** Characters that may hide a comma from the list structure. */
const NESTING_CHARACTER = /[("'\\/]/;

/**
 * Prefixes every selector of the selector list `css[start, end)` with the scope class.
 * It reads the stylesheet by index instead of a substring, which keeps the scan on
 * the stylesheet's own flat text.
 *
 * @param css - Stylesheet text
 * @param start - Index where the selector list starts
 * @param end - Index of the `{` that ends it
 * @param prefix - Scope selector followed by one space, such as `'.my-widget '`
 * @returns The list joined by `,`, each selector trimmed and passed through
 * `prefixSelector`. The list splits only at top-level commas: commas inside
 * parentheses, strings, comments or after a backslash belong to one selector.
 */
export const prefixSelectorList = (
  css: string,
  start: number,
  end: number,
  prefix: string,
): string => {
  let result = '';
  let partStart = start;
  // Tested on the list alone: a search of the whole text could run to its end per list.
  if (!NESTING_CHARACTER.test(css.slice(start, end))) {
    for (;;) {
      const comma = css.indexOf(',', partStart);
      if (comma === -1 || comma >= end)
        return (
          result + prefixSelector(trimSelector(css.slice(partStart, end)), prefix)
        );
      result +=
        prefixSelector(trimSelector(css.slice(partStart, comma)), prefix) + ',';
      partStart = comma + 1;
    }
  }
  let depth = 0;
  for (let index = start; index < end; index++) {
    const code = css.charCodeAt(index);
    // Every character with a branch below is a slash or lower, or a backslash.
    if (code > SLASH && code !== BACKSLASH) continue;
    if (code === COMMA) {
      if (depth !== 0) continue;
      result +=
        prefixSelector(trimSelector(css.slice(partStart, index)), prefix) + ',';
      partStart = index + 1;
    } else if (code === L_PAREN) {
      // Only `url(` can make a parenthesis opaque, and it ends in `l`.
      const next =
        (css.charCodeAt(index - 1) | 32) === 108
          ? skipOpaqueToken(css, index)
          : index;
      if (next > index) index = next - 1;
      else depth++;
    } else if (code === R_PAREN) depth--;
    else {
      const next = skipOpaqueToken(css, index);
      if (next > index) index = next - 1;
    }
  }
  return result + prefixSelector(trimSelector(css.slice(partStart, end)), prefix);
};
