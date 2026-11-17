import {
  BACKSLASH,
  DOUBLE_QUOTE,
  HYPHEN,
  R_PAREN,
  SINGLE_QUOTE,
  UNDERSCORE,
  WHITESPACE_MAX,
} from '../constants/charCode';

/**
 * Finds the end of an unquoted `url(…)` token whose `(` sits at `open`.
 * Its contents are opaque: `/*`, braces and semicolons inside it are not CSS structure.
 *
 * @param css - Stylesheet text
 * @param open - Index of a `(`
 * @returns Index just past the closing `)`, `css.length` when it never closes, or
 * `open` itself when the `(` does not start an unquoted `url(` (another function,
 * such as `myurl(`, or a quoted argument, which the string rules handle).
 */
export const findUnquotedUrlEnd = (css: string, open: number): number => {
  if (
    open < 3 ||
    (css.charCodeAt(open - 3) | 32) !== 117 ||
    (css.charCodeAt(open - 2) | 32) !== 114 ||
    (css.charCodeAt(open - 1) | 32) !== 108 ||
    (open > 3 && isIdentifierCode(css.charCodeAt(open - 4)))
  )
    return open;
  const length = css.length;
  let index = open + 1;
  while (index < length && css.charCodeAt(index) <= WHITESPACE_MAX) index++;
  const first = css.charCodeAt(index);
  if (first === DOUBLE_QUOTE || first === SINGLE_QUOTE) return open;
  for (; index < length; index++) {
    const code = css.charCodeAt(index);
    if (code === BACKSLASH) index++;
    else if (code === R_PAREN) return index + 1;
  }
  return length;
};

/** Tells whether a code unit can continue a CSS identifier, so `url` after it is not a function name. */
const isIdentifierCode = (code: number): boolean =>
  code >= 0x80 ||
  code === HYPHEN ||
  code === UNDERSCORE ||
  code === BACKSLASH ||
  (code >= 48 && code <= 57) ||
  ((code | 32) >= 97 && (code | 32) <= 122);
