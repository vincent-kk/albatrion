import {
  ASTERISK,
  COLON,
  COMMA,
  GT,
  LBRACE,
  L_PAREN,
  PLUS,
  RBRACE,
  R_PAREN,
  SEMICOLON,
  SLASH,
  SPACE,
  TILDE,
} from './constants/asciiByte';
import {
  BYTE_KIND,
  ORDINARY,
  QUOTE,
  SLASH_START,
  WHITESPACE,
} from './constants/byteKind';
import { findCommentEnd } from './utils/findCommentEnd';
import { findStringEnd } from './utils/findStringEnd';
import { isInsideParens } from './utils/isInsideParens';

/**
 * Compresses CSS by removing unnecessary whitespace, comments, and redundant semicolons.
 * Uses byte-level processing for optimal performance while preserving CSS functionality.
 * Prioritizes speed over perfect compression - some trailing spaces may remain.
 *
 * @param css - The CSS string to compress
 * @returns A compressed CSS string with minimal whitespace and no comments
 *
 * @note This function prioritizes performance over perfect compression.
 * Some trailing spaces may remain in certain contexts (e.g., media queries)
 * to avoid expensive post-processing operations.
 *
 * @example
 * ```typescript
 * Basic CSS compression:
 * compressCss('.class { color: red; background: blue; }')
 * // Returns: '.class{color:red;background:blue}'
 *
 * Comment removal:
 * compressCss('.class { color: red; /* inline comment *\/ background: blue; }')
 * // Returns: '.class{color:red;background:blue}'
 *
 * Multiple whitespace handling:
 * compressCss('.class1   { color  :   red  ; margin :  10px   20px  ; }')
 * // Returns: '.class1{color:red;margin:10px 20px}'
 *
 * CSS selectors with combinators:
 * compressCss('.class1   .class2   >   .class3 { color: red; }')
 * // Returns: '.class1 .class2>.class3{color:red}'
 *
 * Media queries (may have trailing spaces for performance):
 * compressCss('@media (max-width: 768px) { .container { padding: 0 16px; } }')
 * // Returns: '@media (max-width:768px){.container{padding:0 16px }}' (note trailing space)
 *
 * Complex CSS with comments:
 * compressCss('.container { width: 100%; /* comment *\/ margin: 0 auto; }')
 * // Returns: '.container{width:100%;margin:0 auto}'
 *
 * Empty input:
 * compressCss('') // Returns: ''
 *```
 */
export const compressCss = (css: string): string => {
  if (css.length === 0) return '';

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const buffer = encoder.encode(css);
  const length = buffer.length;
  const output = new Uint8Array(length);

  let outputIndex = 0;
  let cursor = 0;

  while (cursor < length) {
    const byte = buffer[cursor];
    const kind = BYTE_KIND[byte];

    if (kind === ORDINARY) {
      output[outputIndex++] = byte;
      cursor++;
      continue;
    }

    if (kind === SLASH_START) {
      if (cursor + 1 < length && buffer[cursor + 1] === ASTERISK) {
        cursor = findCommentEnd(buffer, cursor + 2);
        continue;
      }
      output[outputIndex++] = byte;
      cursor++;
      continue;
    }

    if (kind === QUOTE) {
      const stringEnd = findStringEnd(buffer, cursor);
      output.set(buffer.subarray(cursor, stringEnd), outputIndex);
      outputIndex += stringEnd - cursor;
      cursor = stringEnd;
      continue;
    }

    if (kind === WHITESPACE) {
      while (++cursor < length && BYTE_KIND[buffer[cursor]] === WHITESPACE);
      if (outputIndex > 0 && cursor < length) {
        const prevByte = output[outputIndex - 1];
        const nextByte = buffer[cursor];
        const noSpaceAfter =
          prevByte === LBRACE ||
          prevByte === RBRACE ||
          prevByte === SEMICOLON ||
          prevByte === COLON ||
          prevByte === COMMA ||
          prevByte === GT ||
          prevByte === TILDE ||
          prevByte === L_PAREN;

        const noSpaceBefore =
          nextByte === LBRACE ||
          nextByte === RBRACE ||
          nextByte === SEMICOLON ||
          nextByte === COLON ||
          nextByte === COMMA ||
          nextByte === GT ||
          nextByte === TILDE ||
          nextByte === R_PAREN;

        const needsSpaceForFunction =
          nextByte === L_PAREN &&
          ((prevByte >= 65 && prevByte <= 90) ||
            (prevByte >= 97 && prevByte <= 122));

        let needsSpace = !noSpaceAfter && !noSpaceBefore;
        if (needsSpace && (prevByte === PLUS || nextByte === PLUS))
          needsSpace = isInsideParens(output, outputIndex);

        if (needsSpace || needsSpaceForFunction) output[outputIndex++] = SPACE;
      }
      continue;
    }

    let index = cursor + 1;
    while (index < length && buffer[index] === SEMICOLON) index++;
    let head = index;
    let foundNonWhitespace = false;
    while (head < length && !foundNonWhitespace) {
      while (head < length && BYTE_KIND[buffer[head]] === WHITESPACE) head++;
      if (
        head < length - 1 &&
        buffer[head] === SLASH &&
        buffer[head + 1] === ASTERISK
      ) {
        head += 2;
        while (head < length - 1) {
          if (buffer[head] === ASTERISK && buffer[head + 1] === SLASH) {
            head += 2;
            break;
          }
          head++;
        }
      } else foundNonWhitespace = true;
    }
    if (head < length && buffer[head] === RBRACE) {
      cursor = index;
      continue;
    }
    output[outputIndex++] = SEMICOLON;
    cursor = index;
  }

  while (outputIndex > 0 && output[outputIndex - 1] === SPACE) outputIndex--;

  return decoder.decode(output.subarray(0, outputIndex));
};
