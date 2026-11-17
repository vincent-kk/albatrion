import {
  LBRACE,
  L_PAREN,
  RBRACE,
  R_PAREN,
  SEMICOLON,
} from '../constants/asciiByte';

/**
 * Tells whether the end of the compressed output sits inside an open
 * parenthesis, such as within `calc(` or `:nth-child(`.
 *
 * @param output - Compressed bytes written so far
 * @param end - Number of valid bytes in `output`
 * @returns `true` when an unclosed `(` precedes `end` within the current
 * selector or declaration; the scan stops at `{`, `}` or `;`.
 */
export const isInsideParens = (output: Uint8Array, end: number): boolean => {
  let depth = 0;
  for (let index = end - 1; index >= 0; index--) {
    const byte = output[index];
    if (byte === R_PAREN) depth++;
    else if (byte === L_PAREN && depth-- === 0) return true;
    else if (byte === LBRACE || byte === RBRACE || byte === SEMICOLON)
      return false;
  }
  return false;
};
