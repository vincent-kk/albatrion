import {
  ASTERISK,
  DOUBLE_QUOTE,
  LBRACE,
  RBRACE,
  SEMICOLON,
  SINGLE_QUOTE,
  SLASH,
} from '../constants/asciiByte';
import { findStringEnd } from './findStringEnd';

/**
 * Tells whether a colon separates a property from its value, as opposed to
 * starting a pseudo-class or pseudo-element in a selector.
 *
 * @param buffer - UTF-8 bytes of the stylesheet
 * @param colon - Index of the colon byte
 * @returns `true` when a `;` or `}` follows before any `{`, skipping quoted
 * strings and comments. A `{` first, or neither, returns `false`: the colon may
 * belong to a selector, where the whitespace before it is a descendant combinator.
 */
export const isDeclarationColon = (
  buffer: Uint8Array,
  colon: number,
): boolean => {
  const length = buffer.length;
  let index = colon + 1;
  while (index < length) {
    const byte = buffer[index];
    if (byte === SEMICOLON || byte === RBRACE) return true;
    if (byte === LBRACE) return false;
    if (byte === DOUBLE_QUOTE || byte === SINGLE_QUOTE)
      index = findStringEnd(buffer, index);
    else if (byte === SLASH && buffer[index + 1] === ASTERISK) {
      index += 2;
      while (
        index < length &&
        !(buffer[index] === ASTERISK && buffer[index + 1] === SLASH)
      )
        index++;
      index += 2;
    } else index++;
  }
  return false;
};
