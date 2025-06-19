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

const SPACE = 32,
  TAB = 9,
  LF = 10,
  CR = 13,
  SLASH = 47,
  ASTERISK = 42,
  SEMICOLON = 59,
  LBRACE = 123,
  RBRACE = 125,
  COLON = 58,
  COMMA = 44,
  GT = 62,
  PLUS = 43,
  TILDE = 126,
  L_PAREN = 40,
  R_PAREN = 41;
