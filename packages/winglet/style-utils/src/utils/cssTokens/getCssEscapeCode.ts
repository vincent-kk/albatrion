import { type CssSource, readCssCode } from './readCssCode';

/** Decode an escape for ASCII token-name comparisons, without normalizing the source text. */
export const getCssEscapeCode = (source: CssSource, start: number): number => {
  let value = 0,
    count = 0;
  while (count < 6) {
    const code = readCssCode(source, start + 1 + count);
    const digit =
      code >= 48 && code <= 57
        ? code - 48
        : (code | 32) >= 97 && (code | 32) <= 102
          ? (code | 32) - 87
          : -1;
    if (digit === -1) break;
    value = value * 16 + digit;
    count++;
  }
  return count ? value : readCssCode(source, start + 1);
};
