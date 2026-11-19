import {
  BACKSLASH,
  COMMA,
  DOUBLE_QUOTE,
  L_PAREN,
  SINGLE_QUOTE,
  SLASH,
} from '../constants/charCode';
import { prefixSelector } from './prefixSelector';
import { skipOpaqueToken } from './skipOpaqueToken';
import { trimSelector } from './trimSelector';

/** Characters that may hide a comma from the list structure. */
const NESTING_CHARACTER = /[[("'\\/]/;

/** Only these remaining characters can open an opaque selector token. */
const OPAQUE_CHARACTER = new Uint8Array(128);
for (const code of [DOUBLE_QUOTE, SINGLE_QUOTE, SLASH, BACKSLASH, L_PAREN, 91])
  OPAQUE_CHARACTER[code] = 1;

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
          result + prefixSelector(css.slice(partStart, end).trim(), prefix)
        );
      result +=
        prefixSelector(css.slice(partStart, comma).trim(), prefix) + ',';
      partStart = comma + 1;
    }
  }
  for (let index = start; index < end; index++) {
    const code = css.charCodeAt(index);
    // The shared component reader also handles square brackets above the ASCII fast range.
    if (code > SLASH && code !== BACKSLASH && code !== 91) continue;
    if (code === COMMA) {
      result +=
        prefixSelector(trimSelector(css.slice(partStart, index)), prefix) + ',';
      partStart = index + 1;
    } else if (OPAQUE_CHARACTER[code]) {
      const next = skipOpaqueToken(css, index);
      if (next > index) index = next - 1;
    }
  }
  return (
    result + prefixSelector(trimSelector(css.slice(partStart, end)), prefix)
  );
};
