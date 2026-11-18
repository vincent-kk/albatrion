import {
  ASTERISK,
  BACKSLASH,
  COLON,
  COMMA,
  CR,
  DOUBLE_QUOTE,
  GT,
  LBRACE,
  LF,
  L_PAREN,
  PLUS,
  RBRACE,
  R_PAREN,
  SEMICOLON,
  SINGLE_QUOTE,
  SLASH,
  SPACE,
  TAB,
  TILDE,
} from './constants/asciiByte';
import { findUnquotedUrlEnd } from './utils/findUnquotedUrlEnd';
import { isDeclarationColon } from './utils/isDeclarationColon';
import { isInsideParens } from './utils/isInsideParens';

/**
 * Compresses CSS by removing unnecessary whitespace, comments, and redundant semicolons.
 * Uses byte-level processing for optimal performance while preserving CSS functionality.
 * Prioritizes speed over perfect compression - some trailing spaces may remain.
 *
 * @param css - The CSS string to compress
 * @returns A compressed CSS string; empty comments retain boundaries between adjacent tokens
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
  let inComment = false;
  let lastByte = 0;
  let byte: number;

  while (cursor < length) {
    byte = buffer[cursor];

    if (inComment) {
      if (
        byte === ASTERISK &&
        cursor + 1 < length &&
        buffer[cursor + 1] === SLASH
      ) {
        inComment = false;
        cursor += 2;
        const nextByte = buffer[cursor];
        if (lastByte > SPACE && nextByte > SPACE &&
          !isTokenBoundary(lastByte) && !isTokenBoundary(nextByte)) {
          output[outputIndex++] = SLASH;
          output[outputIndex++] = ASTERISK;
          output[outputIndex++] = ASTERISK;
          output[outputIndex++] = SLASH;
          lastByte = SLASH;
        }
        continue;
      }
      cursor++;
      continue;
    }

    // Backslashes consume their following byte; the other branches are at most SEMICOLON.
    if (byte > SEMICOLON) {
      output[outputIndex++] = byte;
      if (byte === BACKSLASH && cursor + 1 < length) {
        output[outputIndex++] = buffer[++cursor];
        lastByte = 0;
      } else lastByte = byte;
      cursor++;
      continue;
    }

    if (
      byte === SLASH &&
      cursor + 1 < length &&
      buffer[cursor + 1] === ASTERISK
    ) {
      inComment = true;
      cursor += 2;
      continue;
    }

    // Copied byte by byte: a subarray and set() per string costs more than the copy.
    if (byte === DOUBLE_QUOTE || byte === SINGLE_QUOTE) {
      output[outputIndex++] = byte;
      while (++cursor < length) {
        const stringByte = buffer[cursor];
        if (stringByte === LF || stringByte === CR || stringByte === 12) break;
        output[outputIndex++] = stringByte;
        if (stringByte === byte) {
          cursor++;
          break;
        }
        if (stringByte === BACKSLASH && cursor + 1 < length) {
          output[outputIndex++] = buffer[++cursor];
          if (buffer[cursor] === CR && buffer[cursor + 1] === LF)
            output[outputIndex++] = buffer[++cursor];
        }
      }
      lastByte = output[outputIndex - 1];
      continue;
    }

    if (byte === L_PAREN) {
      const urlEnd = findUnquotedUrlEnd(buffer, cursor);
      if (urlEnd !== cursor) {
        while (cursor < urlEnd) output[outputIndex++] = buffer[cursor++];
        lastByte = output[outputIndex - 1];
        continue;
      }
    }

    if (byte === SPACE || byte === TAB || byte === LF || byte === CR) {
      while (++cursor < length) {
        const nextByte = buffer[cursor];
        if (
          nextByte !== SPACE &&
          nextByte !== TAB &&
          nextByte !== LF &&
          nextByte !== CR
        )
          break;
      }
      if (outputIndex > 0 && cursor < length) {
        const prevByte = lastByte;
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
        else if (needsSpace && nextByte === COLON)
          needsSpace = !isDeclarationColon(buffer, cursor);

        if (needsSpace || needsSpaceForFunction) {
          output[outputIndex++] = SPACE;
          lastByte = SPACE;
        }
      }
      continue;
    }

    if (byte === SEMICOLON) {
      let index = cursor + 1;
      while (index < length && buffer[index] === SEMICOLON) index++;
      let head = index;
      let foundNonWhitespace = false;
      while (head < length && !foundNonWhitespace) {
        while (
          head < length &&
          (buffer[head] === SPACE ||
            buffer[head] === TAB ||
            buffer[head] === LF ||
            buffer[head] === CR)
        )
          head++;
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
      lastByte = SEMICOLON;
      cursor = index;
      continue;
    }
    output[outputIndex++] = byte;
    lastByte = byte;
    cursor++;
  }

  while (outputIndex > 0 && output[outputIndex - 1] === SPACE) {
    let backslashes = 0;
    for (let index = outputIndex - 2; index >= 0 && output[index] === BACKSLASH; index--) backslashes++;
    if (backslashes % 2 !== 0) break;
    outputIndex--;
  }

  return decoder.decode(output.subarray(0, outputIndex));
};

/** Tells whether punctuation already separates adjacent CSS tokens. */
const isTokenBoundary = (byte: number): boolean =>
  byte === LBRACE || byte === RBRACE || byte === COLON || byte === SEMICOLON || byte === COMMA || byte === R_PAREN;
