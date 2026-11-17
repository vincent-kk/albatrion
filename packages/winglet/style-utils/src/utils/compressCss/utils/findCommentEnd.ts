import { ASTERISK, SLASH } from '../constants/asciiByte';

/**
 * Finds where a block comment ends.
 *
 * @param buffer - UTF-8 bytes of the stylesheet
 * @param start - Index just past the opening `/*`
 * @returns Index just past the closing `*\/`, or `buffer.length` when the
 * comment is unterminated, so the rest of the input is treated as comment.
 */
export const findCommentEnd = (buffer: Uint8Array, start: number): number => {
  const last = buffer.length - 1;
  for (let index = start; index < last; index++)
    if (buffer[index] === ASTERISK && buffer[index + 1] === SLASH)
      return index + 2;
  return buffer.length;
};
