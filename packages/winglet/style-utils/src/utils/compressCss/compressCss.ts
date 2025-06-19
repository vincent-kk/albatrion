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
        continue;
      }
      cursor++;
      continue;
    } else {
      if (
        byte === SLASH &&
        cursor + 1 < length &&
        buffer[cursor + 1] === ASTERISK
      ) {
        inComment = true;
        cursor += 2;
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
          prevByte === PLUS ||
          prevByte === TILDE ||
          prevByte === L_PAREN;

        const noSpaceBefore =
          nextByte === LBRACE ||
          nextByte === RBRACE ||
          nextByte === SEMICOLON ||
          nextByte === COLON ||
          nextByte === COMMA ||
          nextByte === GT ||
          nextByte === PLUS ||
          nextByte === TILDE ||
          nextByte === R_PAREN;

        const needsSpaceForFunction =
          nextByte === L_PAREN &&
          ((prevByte >= 65 && prevByte <= 90) ||
            (prevByte >= 97 && prevByte <= 122));

        if ((!noSpaceAfter && !noSpaceBefore) || needsSpaceForFunction) {
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

  while (outputIndex > 0 && output[outputIndex - 1] === SPACE) outputIndex--;

  return decoder.decode(output.subarray(0, outputIndex));
};

/**
 * ASCII byte constants for CSS compression processing.
 * Used for byte-level parsing and whitespace/symbol detection.
 */
const SPACE = 32, // ' ' - Space character
  TAB = 9, // '\t' - Tab character
  LF = 10, // '\n' - Line feed (newline)
  CR = 13, // '\r' - Carriage return
  SLASH = 47, // '/' - Forward slash (for comments)
  ASTERISK = 42, // '*' - Asterisk (for comments)
  SEMICOLON = 59, // ';' - Semicolon
  LBRACE = 123, // '{' - Left brace
  RBRACE = 125, // '}' - Right brace
  COLON = 58, // ':' - Colon
  COMMA = 44, // ',' - Comma
  GT = 62, // '>' - Greater than (CSS child combinator)
  PLUS = 43, // '+' - Plus (CSS adjacent sibling combinator)
  TILDE = 126, // '~' - Tilde (CSS general sibling combinator)
  L_PAREN = 40, // '(' - Left parenthesis
  R_PAREN = 41; // ')' - Right parenthesis
