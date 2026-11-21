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
  const token = getCssUrlToken(source, open);
  return token === 0 ? open : Math.floor(token / 16);
}
