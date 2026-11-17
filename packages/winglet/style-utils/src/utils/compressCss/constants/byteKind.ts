import {
  CR,
  DOUBLE_QUOTE,
  LF,
  SEMICOLON,
  SINGLE_QUOTE,
  SLASH,
  SPACE,
  TAB,
} from './asciiByte';

/**
 * Byte classes the compressor's main loop dispatches on.
 * `ORDINARY` bytes are copied as is; every other class has its own branch.
 */
export const ORDINARY = 0,
  WHITESPACE = 1,
  SLASH_START = 2,
  QUOTE = 3,
  SEMICOLON_END = 4;

/**
 * Class of every byte value, indexed by the byte itself.
 * One table load replaces a chain of comparisons on the hot path.
 */
export const BYTE_KIND = Uint8Array.from({ length: 256 }, (_, byte) => {
  if (byte === SPACE || byte === TAB || byte === LF || byte === CR)
    return WHITESPACE;
  if (byte === SLASH) return SLASH_START;
  if (byte === DOUBLE_QUOTE || byte === SINGLE_QUOTE) return QUOTE;
  if (byte === SEMICOLON) return SEMICOLON_END;
  return ORDINARY;
});
