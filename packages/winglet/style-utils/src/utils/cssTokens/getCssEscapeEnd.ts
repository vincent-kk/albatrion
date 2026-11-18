import { type CssSource, readCssCode } from './readCssCode';

/**
 * Consume a CSS escape, including the optional whitespace terminating up to six hex digits.
 * @param source Text or UTF-8 stylesheet bytes.
 * @param start Backslash position.
 * @returns First position after the escape; CRLF is one whitespace terminator.
 */
export const getCssEscapeEnd = (source: CssSource, start: number): number => {
  let cursor = start + 1;
  for (let count = 0; count < 6 && cursor < source.length; count++) {
    const code = readCssCode(source, cursor);
    if (
      !(
        (code >= 48 && code <= 57) ||
        (code >= 65 && code <= 70) ||
        (code >= 97 && code <= 102)
      )
    )
      break;
    cursor++;
  }
  const code = readCssCode(source, cursor);
  if (
    cursor === start + 1 ||
    code === 32 ||
    (code >= 9 && code <= 13 && code !== 11)
  ) {
    if (cursor < source.length) cursor++;
    if (code === 13 && readCssCode(source, cursor) === 10) cursor++;
  }
  return cursor;
};
