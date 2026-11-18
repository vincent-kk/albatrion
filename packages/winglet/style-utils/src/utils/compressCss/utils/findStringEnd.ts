import { getCssEscapeEnd } from '../../cssTokens/getCssEscapeEnd';
import { BACKSLASH } from '../constants/asciiByte';

/**
 * Finds where a quoted CSS string ends.
 *
 * @param buffer - UTF-8 bytes of the stylesheet
 * @param start - Index of the opening quote byte
 * @returns Index just past the closing quote, or `buffer.length` when the
 * string is unterminated. A CSS escape includes any hex terminator, so `"a\"b"`
 * ends at its last quote.
 */
export const findStringEnd = (buffer: Uint8Array, start: number): number => {
  const quote = buffer[start];
  const length = buffer.length;
  let index = start + 1;
  while (index < length) {
    const byte = buffer[index];
    if (byte === quote) return index + 1;
    if (byte === 10 || byte === 13 || byte === 12) return index;
    index = byte === BACKSLASH ? getCssEscapeEnd(buffer, index) : index + 1;
  }
  return length;
};
