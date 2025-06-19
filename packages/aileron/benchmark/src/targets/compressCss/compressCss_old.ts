/**
 * Compresses a CSS string by removing unnecessary whitespace and comments.
 *
 * This function is optimized for performance and memory usage.
 * It uses a single-pass approach to compress the CSS string.
 *
 * @example
 * ```typescript
 * const compressed = compressCss('.container { color: red; }');
 * // Returns: '.container{color:red}'
 * ```
 *
 * @param css - CSS string to compress
 * @returns Compressed CSS string
 */
export const compressCss = (css: string): string => {
  const length = css.length;
  if (length === 0) return '';

  // Pre-allocate buffer - worst case is same size as input
  const output = new Uint16Array(length);
  let outputIndex = 0;
  let cursor = 0;
  let inComment = false;
  let lastNonWhitespace = 0;
  let needsSpace = false;

  while (cursor < length) {
    const charCode = css.charCodeAt(cursor);

    // Handle comments
    if (!inComment) {
      // Check for comment start: '/*'
      if (
        charCode === 47 &&
        cursor + 1 < length &&
        css.charCodeAt(cursor + 1) === 42
      ) {
        inComment = true;
        cursor += 2;
        continue;
      }
    } else {
      // Check for comment end: '*/'
      if (
        charCode === 42 &&
        cursor + 1 < length &&
        css.charCodeAt(cursor + 1) === 47
      ) {
        inComment = false;
        cursor += 2;
        continue;
      }
      cursor++;
      continue;
    }

    // Handle whitespace
    // space(32), tab(9), newline(10), carriage return(13)
    if (
      charCode === 32 ||
      charCode === 9 ||
      charCode === 10 ||
      charCode === 13
    ) {
      // Skip consecutive whitespace
      while (++cursor < length) {
        const nextCode = css.charCodeAt(cursor);
        if (
          nextCode !== 32 &&
          nextCode !== 9 &&
          nextCode !== 10 &&
          nextCode !== 13
        )
          break;
      }

      // Determine if we need to keep a space
      if (outputIndex > 0 && cursor < length) {
        const prevCode = lastNonWhitespace;
        const nextCode = css.charCodeAt(cursor);

        // Rules for keeping space:
        // 1. Not after special chars: { } ; : , > + ~
        if (
          prevCode === 123 ||
          prevCode === 125 ||
          prevCode === 59 ||
          prevCode === 58 ||
          prevCode === 44 ||
          prevCode === 62 ||
          prevCode === 43 ||
          prevCode === 126
        )
          needsSpace = false;
        // 2. Not before special chars
        else if (
          nextCode === 123 ||
          nextCode === 125 ||
          nextCode === 59 ||
          nextCode === 58 ||
          nextCode === 44 ||
          nextCode === 62 ||
          nextCode === 43 ||
          nextCode === 126
        )
          needsSpace = false;
        // 3. Not after ) unless before (
        else if (prevCode === 41 && nextCode !== 40) needsSpace = false;
        // 4. Keep space between letter and (
        else if (
          nextCode === 40 &&
          ((prevCode >= 65 && prevCode <= 90) ||
            (prevCode >= 97 && prevCode <= 122))
        )
          needsSpace = true;
        else needsSpace = true;

        if (needsSpace) output[outputIndex++] = 32; // space
      }
      continue;
    }

    // Handle semicolons
    if (charCode === 59) {
      // Skip duplicate semicolons
      let j = cursor + 1;
      while (j < length && css.charCodeAt(j) === 59) j++;

      // Check if semicolon is before } (with possible whitespace in between)
      let k = j;
      while (k < length) {
        const nextCode = css.charCodeAt(k);
        if (
          nextCode === 32 ||
          nextCode === 9 ||
          nextCode === 10 ||
          nextCode === 13
        )
          k++;
        else break;
      }

      // Skip semicolon if followed by }
      if (k < length && css.charCodeAt(k) === 125) {
        cursor = j;
        continue;
      }

      output[outputIndex++] = 59;
      lastNonWhitespace = 59;
      cursor = j;
      continue;
    }

    // Regular character
    output[outputIndex++] = charCode;
    lastNonWhitespace = charCode;
    cursor++;
  }

  // Convert back to string, trimming trailing whitespace
  while (outputIndex > 0 && output[outputIndex - 1] === 32) outputIndex--;

  // Post-process to remove semicolons before closing braces
  // This handles cases where semicolons were added before we knew a } was coming
  let finalOutputIndex = 0;
  for (let i = 0; i < outputIndex; i++) {
    const charCode = output[i];
    if (charCode === 59) {
      let j = i + 1;
      while (j < outputIndex && output[j] === 32) j++;
      if (j < outputIndex && output[j] === 125) continue;
    }
    output[finalOutputIndex++] = charCode;
  }

  // Build result string from buffer
  let result = '';
  for (let j = 0; j < finalOutputIndex; j++)
    result += String.fromCharCode(output[j]);
  return result;
};
