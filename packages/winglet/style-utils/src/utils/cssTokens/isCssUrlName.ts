import { getCssEscapeCode } from './getCssEscapeCode';
import { getCssEscapeEnd } from './getCssEscapeEnd';
import { type CssSource, readCssCode } from './readCssCode';

/**
 * Match the decoded ASCII URL name without materializing an identifier string.
 * @param source Stylesheet code units or bytes.
 * @param start First identifier code unit.
 * @param end Position after its complete name.
 * @returns Whether exactly the three letters URL are present, ignoring ASCII case.
 */
export function isCssUrlName(source: CssSource, start: number, end: number): boolean {
  let index = start;
  for (let count = 0; count < 3; count++) {
    const code = readCssCode(source, index);
    if (((code === 92 ? getCssEscapeCode(source, index) : code) | 32) !== (count === 0 ? 117 : count === 1 ? 114 : 108)) return false;
    index = code === 92 ? getCssEscapeEnd(source, index) : index + 1;
  }
  return index === end;
}
