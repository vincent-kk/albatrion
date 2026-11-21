import { getCssUrlToken } from './getCssUrlToken';
import { isCssNameBoundary } from './isCssNameBoundary';
import { type CssSource, readCssCode } from './readCssCode';

/**
 * Recognize a plain URL opening at a known parenthesis position.
 * @param source Stylesheet code units or bytes.
 * @param open Opening parenthesis to inspect.
 * @returns End of the opaque unquoted URL, or the input position for other functions.
 */
export function getCssUrlEndAtOpen(source: CssSource, open: number): number {
  if (open < 3 || (readCssCode(source, open - 3) | 32) !== 117 || (readCssCode(source, open - 2) | 32) !== 114 || (readCssCode(source, open - 1) | 32) !== 108 || !isCssNameBoundary(source, open - 3)) return open;
  let index = open + 1;
  while (index < source.length) {
    const code = readCssCode(source, index);
    if (code !== 32 && code !== 9 && code !== 10 && code !== 12 && code !== 13) break;
    index++;
  }
  const quote = readCssCode(source, index);
  return quote === 34 || quote === 39 ? open : Math.floor(getCssUrlToken(source, open) / 16);
}
