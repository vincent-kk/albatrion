import { getCssEscapeEnd } from './getCssEscapeEnd';
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
  for (let index = start - 2; index >= 0 && index >= start - 9; index--)
    if (readCssCode(source, index) === 92) {
      let slashes = 1;
      while (
        index - slashes >= 0 &&
        readCssCode(source, index - slashes) === 92
      )
        slashes++;
      if (slashes % 2 && getCssEscapeEnd(source, index) >= start) return false;
      break;
    }
  return true;
};
