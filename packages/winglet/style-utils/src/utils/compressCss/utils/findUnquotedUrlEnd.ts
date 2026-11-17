import {
  BACKSLASH,
  DOUBLE_QUOTE,
  R_PAREN,
  SINGLE_QUOTE,
  SPACE,
} from '../constants/asciiByte';

/**
 * Finds the end of an unquoted `url(…)` token whose `(` sits at `open`.
 * Its bytes are opaque: a `/*` inside it does not open a comment.
 *
 * @param buffer - UTF-8 bytes of the stylesheet
 * @param open - Index of a `(` byte
 * @returns Index just past the closing `)`, `buffer.length` when it never closes,
 * or `open` itself when the `(` does not start an unquoted `url(` (another
 * function, or a quoted argument, which the string rule copies).
 */
export const findUnquotedUrlEnd = (
  buffer: Uint8Array,
  open: number,
): number => {
  if (
    open < 3 ||
    (buffer[open - 1] | 32) !== 108 ||
    (buffer[open - 2] | 32) !== 114 ||
    (buffer[open - 3] | 32) !== 117
  )
    return open;
  const length = buffer.length;
  let index = open + 1;
  while (index < length && buffer[index] <= SPACE) index++;
  if (buffer[index] === DOUBLE_QUOTE || buffer[index] === SINGLE_QUOTE)
    return open;
  for (; index < length; index++) {
    if (buffer[index] === BACKSLASH) index++;
    else if (buffer[index] === R_PAREN) return index + 1;
  }
  return length;
};
