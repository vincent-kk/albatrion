import { type CssSource, readCssCode } from './readCssCode';

/** Distinguish a real token boundary from whitespace or punctuation consumed by an earlier escape. */
export const isCssNameBoundary = (
  source: CssSource,
  start: number,
): boolean => {
  const previous = readCssCode(source, start - 1);
  if (
    previous >= 128 ||
    previous === 45 ||
    previous === 95 ||
    previous === 92 ||
    (previous >= 48 && previous <= 57) ||
    ((previous | 32) >= 97 && (previous | 32) <= 122)
  )
    return false;
  let boundary = start - 1;
  if (previous === 10 && readCssCode(source, boundary - 1) === 13) boundary--;
  let cursor = boundary - 1;
  if (readCssCode(source, cursor) === 92)
    return !isUnescapedBackslash(source, cursor);
  if (previous === 32 || (previous >= 9 && previous <= 13 && previous !== 11)) {
    let count = 0;
    while (count < 6 && cursor >= 0) {
      const code = readCssCode(source, cursor);
      if (
        !(
          (code >= 48 && code <= 57) ||
          ((code | 32) >= 97 && (code | 32) <= 102)
        )
      )
        break;
      cursor--;
      count++;
    }
    if (count && readCssCode(source, cursor) === 92)
      return !isUnescapedBackslash(source, cursor);
  }
  return true;
};

/** An odd contiguous run ends with a live CSS escape rather than an escaped backslash. */
const isUnescapedBackslash = (source: CssSource, end: number): boolean => {
  let count = 0;
  while (end >= 0 && readCssCode(source, end--) === 92) count++;
  return count % 2 !== 0;
};
